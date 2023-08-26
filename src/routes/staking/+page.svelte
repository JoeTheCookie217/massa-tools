<script lang="ts">
	import { Args, bytesToU64, type IClient } from '@massalabs/massa-web3';
	import { clientStore } from '../../store/account';
	import Button from '../../components/button.svelte';
	import { fetchTokenBalance } from '../../services/datastore';
	import { onMount } from 'svelte';
	import { ChainId, parseUnits, Token, TokenAmount } from '@dusalabs/sdk';
	import { client } from '../../utils/client';

	const stakingAddress = 'AS12JQvjYoVUpdh3eJLBU8jSVdqxNYDkFD9oQpcrj8pThgryiRdT7';
	const depositToken = new Token(
		ChainId.BUILDNET,
		'AS1Tzj3E735idxk4j7LxdiYwkvfJv4ZJ7Lqc14ryrEB5BLJfCPKX',
		9
	); // vault WMAS-USDC
	const rewardToken = new Token(
		ChainId.BUILDNET,
		'AS1TVPQb8SWscuLjhhPwCtqAwD7BjnD2pPSju9aQug2a2Cxmrjq5',
		6
	);
	let depositAmount: number;

	let massaClient: IClient;
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});
	$: connectedAddress = massaClient?.wallet().getBaseAccount()?.address();

	let depositBalance = 0n;
	let stakedBalance = 0n;
	let rewardBalance = 0n;
	let pendingBalance = 0n;
	let totalStaked = 0n;

	$: {
		fetchBalances();
		fetchStakingInfo();
	}

	const fetchBalances = () => {
		if (!connectedAddress) return;

		fetchTokenBalance(depositToken.address, connectedAddress).then((balance) => {
			depositBalance = balance;
		});
		fetchTokenBalance(rewardToken.address, connectedAddress).then((balance) => {
			rewardBalance = balance;
		});
	};

	const fetchStakingInfo = () => {
		if (!connectedAddress) return;

		client
			.smartContracts()
			.readSmartContract({
				targetAddress: stakingAddress,
				targetFunction: 'getUserStakedAmount',
				parameter: new Args().addString(connectedAddress),
				maxGas: 100_000_000n
			})
			.then((result) => {
				stakedBalance = bytesToU64(result.returnValue);
			});
		client
			.smartContracts()
			.readSmartContract({
				targetAddress: stakingAddress,
				targetFunction: 'getPendingRewards',
				parameter: new Args().addString(connectedAddress),
				maxGas: 100_000_000n
			})
			.then((result) => {
				pendingBalance = bytesToU64(result.returnValue);
			});
		client
			.smartContracts()
			.readSmartContract({
				targetAddress: stakingAddress,
				targetFunction: 'getTotalStakedAmount',
				parameter: new Args().addString(connectedAddress),
				maxGas: 100_000_000n
			})
			.then((result) => {
				totalStaked = bytesToU64(result.returnValue);
			});
	};

	const deposit = () => {
		if (!massaClient) return;

		const amount = parseUnits(depositAmount.toString(), depositToken.decimals);
		massaClient
			.smartContracts()
			.callSmartContract({
				targetAddress: stakingAddress,
				functionName: 'deposit',
				parameter: new Args().addU64(amount),
				coins: 0n,
				maxGas: 100_000_000n,
				fee: 0n
			})
			.then((txId) => {
				console.log(txId);
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const withdraw = () => {
		if (!massaClient) return;

		massaClient
			.smartContracts()
			.callSmartContract({
				targetAddress: stakingAddress,
				functionName: 'withdraw',
				parameter: [],
				coins: 0n,
				maxGas: 100_000_000n,
				fee: 0n
			})
			.then((txId) => {
				console.log(txId);
			})
			.catch((e) => {
				console.log(e);
			});
	};
</script>

{#if connectedAddress}
	<div class="">
		<input type="number" bind:value={depositAmount} />
		<Button onClick={deposit} text="Deposit" />
		<Button onClick={withdraw} text="Withdraw" />

		<div class="flex flex-col">
			<div>
				<span> Deposit Token Balance: </span>
				<span>
					{new TokenAmount(depositToken, depositBalance).toSignificant()}
				</span>
			</div>
			<div>
				<span> Staked Balance: </span>
				<span>
					{new TokenAmount(depositToken, stakedBalance).toSignificant()}
				</span>
			</div>
			<div>
				<span> Total staked: </span>
				<span>
					{new TokenAmount(depositToken, totalStaked).toSignificant()}
				</span>
			</div>
			<div>
				<span> Pending Rewards: </span>
				<span>
					{new TokenAmount(rewardToken, pendingBalance).toSignificant()}
				</span>
			</div>
		</div>
	</div>
{:else}
	<p>Connect your wallet</p>
{/if}
