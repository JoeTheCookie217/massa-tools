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
	import { fetchMasBalance, getDatastore } from '$lib/services/datastore';
	import { parseEther } from '@dusalabs/sdk';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildReceive, buildSubmit } from './methods';
	import { get } from 'svelte/store';
	import clientStore from '$lib/store/client';

	import { page } from '$app/stores';
	import { error } from '@sveltejs/kit';
	import { printMasBalance } from '$lib/utils/methods';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { addRecentMultisig } from '$lib/utils/localStorage';
	const { address: multisigAddress } = $page.params;

	const client = get(clientStore);

	let massaClient = get(clientStore);
	clientStore.subscribe((client) => (massaClient = client));
	$: connectedAddress = massaClient?.wallet().getBaseAccount()?.address();

	let owners: string[];
	let required: number;
	let balance = 0n;

	let submitTo: string;
	let submitValue: number;

	let receiveValue: number;

	onMount(() => {
		fetchMasBalance(multisigAddress).then((b) => (balance = b));
	});

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

	const submit = () => {
		const value = parseEther(submitValue.toString());
		const submitData = buildSubmit(multisigAddress, submitTo, value, new Uint8Array());
		send(submitData);
	};

	const receive = () => {
		const value = parseEther(receiveValue.toString());
		const receiveData = buildReceive(multisigAddress, value);
		send(receiveData);
	};

	onMount(() => {
		addRecentMultisig(multisigAddress);
	});
</script>

{#await fetchMultisigInfo(multisigAddress)}
	<p>loading...</p>
{:then}
	{#if connectedAddress}
		{#if owners.includes(connectedAddress)}
			<div>
				<div class="">
					<Label for="recipient">Recipient</Label>
					<Input type="text" id="recipient" placeholder="user or smart contract address" />
				</div>
				<div class="">
					<Label for="submitValue">Value (MAS)</Label>
					<Input type="number" id="submitValue" placeholder="1.234" bind:value={submitValue} />
				</div>
				<Button on:click={submit}>Submit</Button>
			</div>
			<div>
				<div class="">
					<Label for="receiveValue">Value (MAS)</Label>
					<Input type="text" id="receiveValue" placeholder="1.234" bind:value={receiveValue} />
				</div>
				<Button on:click={receive}>Deposit</Button>
			</div>

			<div class="flex flex-col">
				<div>
					<span>Balance:</span>
					<span>{printMasBalance(balance.toString())}</span>
				</div>
				<div>
					<span>Required:</span>
					<span>{required}</span>
				</div>
				<div>
					<span>Owners:</span>
					<span>{owners.join()}</span>
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
