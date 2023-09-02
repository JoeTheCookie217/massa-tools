<script lang="ts">
	import {
		Args,
		bytesToU64,
		strToBytes,
		type Client,
		type ICallData,
		bytesToArray,
		ArrayTypes
	} from '@massalabs/massa-web3';
	import { clientStore } from '../../store/account';
	import Button from '../../components/button.svelte';
	import { fetchTokenBalance } from '../../services/datastore';
	import { ChainId, parseUnits, Token, TokenAmount } from '@dusalabs/sdk';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { sendTx } from '../../hooks/sendTx';
	import {
		buildDeposit,
		buildHarvest,
		buildIncreaseAllowance,
		buildWithdraw
	} from '../../services/serialize';
	import { get } from 'svelte/store';
	import networkStore from '../../store/network';
	dayjs.extend(relativeTime);

	const client = get(networkStore);

	let massaClient: Client | null = null;
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});
	$: connectedAddress = massaClient?.wallet().getBaseAccount()?.address();

	let owners: string[];
	let required: number;

	$: {
		fetchStakingInfo(connectedAddress);
	}

	const fetchStakingInfo = (address: string | undefined) => {
		if (!address) return;

		client
			.publicApi()
			.getDatastoreEntries([
				{
					address: multisigAddress,
					key: strToBytes('owners')
				},
				{
					address: multisigAddress,
					key: strToBytes('required')
				}
			])
			.then((result) => {
				const res0 = result[0].final_value;
				if (res0) {
					owners = bytesToArray(res0, ArrayTypes.STRING);
				}

				const res1 = result[1].final_value;
				if (res1) {
					required = Number(bytesToU64(res1));
				}
			});
	};

	const { send, subscribe } = sendTx();
	subscribe((x) => {
		console.log(x);
	});

	// $: depositData = buildDeposit(depositAmount, depositToken, multisigAddress);
	// const deposit = () => send(depositData);

	// $: withdrawData = buildWithdraw(withdrawAmount, depositToken, multisigAddress);
	// const withdraw = () => send(withdrawData);

	// $: harvestData = buildHarvest(multisigAddress);
	// const harvest = () => send(harvestData);

	// $: approveData = buildIncreaseAllowance(
	// 	parseUnits(depositAmount.toString(), depositToken.decimals),
	// 	depositToken.address,
	// 	multisigAddress
	// );
	// const approve = () => send(approveData);
</script>

{#if connectedAddress}
	<div class="">
		<!-- <div>
			<input type="number" bind:value={depositAmount} />
			<Button onClick={approve} text="Approve" />
			<Button onClick={deposit} text="Deposit" />
		</div>
		<div>
			<input type="number" bind:value={withdrawAmount} />
			<Button onClick={withdraw} text="Withdraw" />
			<Button onClick={harvest} text="Harvest" />
		</div> -->

		<div class="flex flex-col">
			<div>
				<span>Required:</span>
				<span>{required}</span>
			</div>
			<div>
				<span>Owners:</span>
				<span>{owners.join()}</span>
			</div>
		</div>
	</div>
{:else}
	<p>Connect your wallet</p>
{/if}
