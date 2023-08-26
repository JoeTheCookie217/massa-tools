<script lang="ts">
	import {
		Args,
		bytesToU64,
		strToBytes,
		type IClient,
		type ICallData
	} from '@massalabs/massa-web3';
	import { clientStore } from '../../store/account';
	import Button from '../../components/button.svelte';
	import { fetchTokenBalance } from '../../services/datastore';
	import { onMount } from 'svelte';
	import { ChainId, parseUnits, Token, TokenAmount } from '@dusalabs/sdk';
	import { client } from '../../utils/client';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { sendTx } from '../../hooks/sendTx';
	import {
		buildDeposit,
		buildHarvest,
		buildIncreaseAllowance,
		buildWithdraw
	} from '../../services/serialize';
	dayjs.extend(relativeTime);

	const stakingAddress = 'AS177fsNiteqhKQ2nKhjQvKvZrZ9WXBAp27rGfx2AabwpRf7FfAJ';
	const depositToken = new Token(
		ChainId.BUILDNET,
		'AS1Tzj3E735idxk4j7LxdiYwkvfJv4ZJ7Lqc14ryrEB5BLJfCPKX',
		9
	); // vault WMAS-USDC
	const rewardToken = new Token(
		ChainId.BUILDNET,
		'AS1DPfKnRKCH1aMreX1wagxxeMiV8UeWAWvQqgM4GyuA3gAMi55y',
		6
	);
	let depositAmount: number = 0;
	let withdrawAmount: number = 0;

	let massaClient: IClient | null = null;
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

		client
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
		client
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
		client
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
		client
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

	const { send } = sendTx();

	const depositData: ICallData = buildDeposit(depositAmount, depositToken, stakingAddress);
	const deposit = () => send(depositData);

	const withdrawData: ICallData = buildWithdraw(withdrawAmount, depositToken, stakingAddress);
	const withdraw = () => send(withdrawData);

	const harvestData = buildHarvest(stakingAddress);
	const harvest = () => send(harvestData);

	const approveData = buildIncreaseAllowance(
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
			<Button onClick={approve} text="Approve" />
			<Button onClick={deposit} text="Deposit" />
		</div>
		<div>
			<input type="number" bind:value={withdrawAmount} />
			<Button onClick={withdraw} text="Withdraw" />
			<Button onClick={harvest} text="Harvest" />
		</div>

		<div class="flex flex-col">
			<div>
				<span>Deposit Token Balance:</span>
				<span>
					{new TokenAmount(depositToken, depositBalance).toSignificant()}
				</span>
			</div>
			<div>
				<span>Staked Balance:</span>
				<span>
					{new TokenAmount(depositToken, stakedBalance).toSignificant()}
				</span>
			</div>
			<div>
				<span>Total staked:</span>
				<span>
					{new TokenAmount(depositToken, totalStaked).toSignificant()}
				</span>
			</div>
			<div>
				<span>Pending Rewards:</span>
				<span>
					{new TokenAmount(rewardToken, pendingBalance).toSignificant()}
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
