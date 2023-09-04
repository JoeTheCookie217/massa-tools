<script lang="ts">
	import {
		Args,
		bytesToU64,
		strToBytes,
		type Client,
		type ICallData,
		bytesToArray,
		ArrayTypes,
		bytesToI32,
		bytesToStr,
		byteToBool
	} from '@massalabs/massa-web3';
	import { clientStore } from '$lib/store/account';
	import Button from '$lib/components/button.svelte';
	import { fetchTokenBalance, getDatastore } from '$lib/services/datastore';
	import { ChainId, parseUnits, Token, TokenAmount } from '@dusalabs/sdk';

	import dayjs from 'dayjs';
	dayjs.extend(relativeTime);

	import relativeTime from 'dayjs/plugin/relativeTime';
	import { sendTx } from '$lib/hooks/sendTx';
	import {
		buildDeposit,
		buildHarvest,
		buildIncreaseAllowance,
		buildWithdraw
	} from '$lib/services/serialize';
	import { get } from 'svelte/store';
	import networkStore from '$lib/store/network';

	import { page } from '$app/stores';
	import { error } from '@sveltejs/kit';
	const { address: multisigAddress } = $page.params;

	const client = get(networkStore);

	let massaClient: Client | null = null;
	clientStore.subscribe((client) => {
		if (client) massaClient = client;
	});
	$: connectedAddress = massaClient?.wallet().getBaseAccount()?.address();

	let owners: string[];
	let required: number;

	// $: {
	// 	console.log(connectedAddress);
	// 	fetchMultisigInfo(connectedAddress);
	// }

	const fetchMultisigInfo = async (address: string | undefined) => {
		if (!address) return;

		const OWNER_PREFIX = 'is_owner::';
		const ownerKeys = await getDatastore(address).then((entries) => {
			return entries.filter((entry) => entry.startsWith(OWNER_PREFIX));
		});

		client
			.publicApi()
			.getDatastoreEntries([
				{
					address: multisigAddress,
					key: strToBytes('required')
				},
				...ownerKeys.map((key) => ({
					address: multisigAddress,
					key: strToBytes(key)
				}))
			])
			.then((result) => {
				const requiredRed = result[0].final_value;
				if (requiredRed) required = bytesToI32(requiredRed);

				const ownersRes = result.slice(1);
				const newOwners = [];
				for (let i = 0; i < ownersRes.length; i++) {
					const res = ownersRes[i].final_value;
					if (res) {
						if (byteToBool(res)) {
							const caller = ownerKeys[i].slice(OWNER_PREFIX.length);
							newOwners.push(caller);
						}
					}
				}
				console.log(newOwners);
				owners = newOwners;
			})
			.catch(() => {
				throw error(404, 'Multisig not found');
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

{#await fetchMultisigInfo(multisigAddress)}
	<p>loading...</p>
{:then}
	{#if connectedAddress}
		{#if owners.includes(connectedAddress)}
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
			<p>You are not an owner</p>
		{/if}
	{:else}
		<p>Connect your wallet</p>
	{/if}
{:catch error}
	<p>{error.message}</p>
{/await}
