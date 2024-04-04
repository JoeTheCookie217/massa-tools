<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import { fetchEvents } from '$lib/services/datastore';
	import { EventDecoder } from '@dusalabs/sdk';
	import type { IEvent } from '@massalabs/massa-web3';

	let txHash = '';
	let events: IEvent[] = [];
	let showDetails = false;
	let decodeSmart = false;

	const extractKeyword = (bytes: string): string => bytes.split(':')[0];

	const handleSearch = async (txId: string) => {
		console.log('handleSearch', txId);
		const { isError, events: e } = await fetchEvents(txId);
		console.log({ isError, e });
		events = e;
	};

	$: {
		if (txHash) handleSearch(txHash);
		else events = [];
	}
</script>

<Input bind:value={txHash} />

<div class="flex flex-col gap-2">
	<div class="flex gap-2">
		<Label for="details">Show details</Label>
		<Checkbox id="details" bind:checked={showDetails} />
	</div>
	<div class="flex gap-2">
		<Label for="smart">Smart decode (Dusa events)</Label>
		<Checkbox id="smart" bind:checked={decodeSmart} />
	</div>
</div>
{#if events.length}
	{#each events as event}
		{#if showDetails}
			<div>
				{JSON.stringify(event, null, 2)}
			</div>
		{:else}
			<div>
				{#if decodeSmart}
					{@const method = event.data.startsWith('SWAP:')
						? EventDecoder.decodeSwap
						: event.data.startsWith('DEPOSITED_TO_BIN:') ||
						  event.data.startsWith('WITHDRAWN_FROM_BIN:')
						? EventDecoder.decodeLiquidity
						: event.data.startsWith('FEES_COLLECTED:')
						? EventDecoder.decodeLiquidity
						: event.data.startsWith('TransferSingle:')
						? EventDecoder.decodeLBTransfer
						: () => event.data}
					{EventDecoder.extractParams(event.data).length ? extractKeyword(event.data) : null}
					{JSON.stringify(method(event.data))}
				{:else}
					{EventDecoder.decodeError(event.data)}
				{/if}
			</div>
		{/if}
	{/each}
{/if}
