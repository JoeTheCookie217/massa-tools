<script lang="ts">
	import { Args, bytesToU64, strToBytes, type Client, type ICallData } from '@massalabs/massa-web3';
	import { Button } from '$lib/components/ui/button';
	import { fetchTokenBalance } from '$lib/services/datastore';
	import { ChainId, parseUnits, Token, TokenAmount } from '@dusalabs/sdk';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { sendTx } from '$lib/hooks/sendTx';
	import {
		buildDeposit,
		buildHarvest,
		buildIncreaseAllowance,
		buildWithdraw
	} from '$lib/services/serialize';
	import { get } from 'svelte/store';
	import clientStore from '$lib/store/client';
	dayjs.extend(relativeTime);

	const stakingAddress = 'AS122MZkHytLQnBA6qExyfpYoRzy1No64j9oDqUHhmas3uBfhV38A';
	const depositToken = new Token(
		ChainId.BUILDNET,
		'AS1Tzj3E735idxk4j7LxdiYwkvfJv4ZJ7Lqc14ryrEB5BLJfCPKX',
		9,
		'WMAS-USDC APT'
	);
	const rewardToken = new Token(
		ChainId.BUILDNET,
		'AS1uoB1HuRXZwvtE7xrW2ZBFbGrnaFEq2BynV1XPAV2bdM52dp87',
		6,
		'reDUSA'
	);
	let depositAmount: number = 0;
	let withdrawAmount: number = 0;

	let massaClient = get(clientStore);
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});
	$: connectedAddress = massaClient?.wallet().getBaseAccount()?.address();

	let depositBalance = 0n;
	let stakedBalance = 0n;
	let rewardBalance = 0n;
	let pendingBalance = 0n;

	let totalStaked: bigint = 0n;
	let lastUpdate: number;
	let rewardPerToken: number;
	let rewardRate: number;

	$: {
		fetchBalances(connectedAddress);
		fetchStakingInfo(connectedAddress);
	}

	const fetchBalances = (address: string | undefined) => {
		if (!address) return;

		fetchTokenBalance(depositToken.address, address).then((balance) => {
			depositBalance = balance;
		});
		fetchTokenBalance(rewardToken.address, address).then((balance) => {
			rewardBalance = balance;
		});
	};

	const fetchStakingInfo = (address: string | undefined) => {
		if (!address) return;

		massaClient
			.smartContracts()
			.readSmartContract({
				targetAddress: stakingAddress,
				targetFunction: 'getUserStakedAmount',
				parameter: new Args().addString(address),
				maxGas: 100_000_000n
			})
			.then((result) => {
				stakedBalance = bytesToU64(result.returnValue);
			});
		massaClient
			.smartContracts()
			.readSmartContract({
				targetAddress: stakingAddress,
				targetFunction: 'getPendingRewards',
				parameter: new Args().addString(address),
				maxGas: 100_000_000n
			})
			.then((result) => {
				pendingBalance = bytesToU64(result.returnValue);
			});
		massaClient
			.smartContracts()
			.readSmartContract({
				targetAddress: stakingAddress,
				targetFunction: 'getTotalStakedAmount',
				parameter: [],
				maxGas: 100_000_000n
			})
			.then((result) => {
				totalStaked = bytesToU64(result.returnValue);
			});
		massaClient
			.publicApi()
			.getDatastoreEntries([
				{
					address: stakingAddress,
					key: strToBytes('lastUpdateTimestamp')
				},
				{
					address: stakingAddress,
					key: strToBytes('rewardPerToken')
				},
				{
					address: stakingAddress,
					key: strToBytes('rewardRate')
				}
			])
			.then((result) => {
				const res0 = result[0].final_value;
				if (res0) {
					lastUpdate = Number(bytesToU64(res0));
				}

				const res1 = result[1].final_value;
				if (res1) {
					rewardPerToken = Number(bytesToU64(res1));
				}

				const res2 = result[2].final_value;
				if (res2) {
					rewardRate = Number(bytesToU64(res2));
				}
			});
	};

	const { send, subscribe } = sendTx();
	subscribe((x) => {
		console.log(x);
	});

	$: depositData = buildDeposit(depositAmount, depositToken, stakingAddress);
	const deposit = () => send(depositData);

	$: withdrawData = buildWithdraw(withdrawAmount, depositToken, stakingAddress);
	const withdraw = () => send(withdrawData);

	$: harvestData = buildHarvest(stakingAddress);
	const harvest = () => send(harvestData);

	$: approveData = buildIncreaseAllowance(
		parseUnits(depositAmount.toString(), depositToken.decimals),
		depositToken.address,
		stakingAddress
	);
	const approve = () => send(approveData);
</script>

{#if connectedAddress}
	<div class="">
		<div>
			<input type="number" bind:value={depositAmount} />
			<Button on:click={approve}>Approve</Button>
			<Button on:click={deposit}>Deposit</Button>
		</div>
		<div>
			<input type="number" bind:value={withdrawAmount} />
			<Button on:click={withdraw}>Withdraw</Button>
			<Button on:click={harvest}>Harvest</Button>
		</div>

		<div class="flex flex-col">
			<div>
				<span>Deposit Token Balance:</span>
				<span>
					{new TokenAmount(depositToken, depositBalance).toSignificant()}
					{depositToken.symbol}
				</span>
			</div>
			<div>
				<span>Staked Balance:</span>
				<span>
					{new TokenAmount(depositToken, stakedBalance).toSignificant()}
					{depositToken.symbol}
				</span>
			</div>
			<div>
				<span>Total staked:</span>
				<span>
					{new TokenAmount(depositToken, totalStaked).toSignificant()}
					{depositToken.symbol}
				</span>
			</div>
			<div>
				<span>Pending Rewards:</span>
				<span>
					{new TokenAmount(rewardToken, pendingBalance).toSignificant()}
					{rewardToken.symbol}
				</span>
				<span>(last update: {lastUpdate ? dayjs(lastUpdate).fromNow() : 'never'})</span>
			</div>
			<div>
				<span>Reward Per Token:</span>
				<span>{rewardPerToken}</span>
			</div>
			<div>
				<span>Reward Rate:</span>
				<span>{rewardRate}</span>
			</div>
		</div>
	</div>
{:else}
	<p>Connect your wallet</p>
{/if}
