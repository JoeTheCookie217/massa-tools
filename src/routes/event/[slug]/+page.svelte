<script lang="ts">
	import { page } from '$app/stores';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Label } from '$lib/components/ui/label';
	import { fetchEvents } from '$lib/services/datastore';
	import { EventDecoder } from '@dusalabs/sdk';
	import type { IEvent } from '@massalabs/massa-web3';
	import { onMount } from 'svelte';

	$: url = $page.url.pathname;
	let txHash = url?.split('/').pop();
	let events: IEvent[] = [];
	let showDetails = false;
	let decodeSmart = false;

	const extractKeyword = (bytes: string): string => bytes.split(':')[0];

	onMount(async () => {
		if (txHash) fetchEvents(txHash).then((r) => (events = r.events));
	});
</script>

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
	<div class="flex flex-col gap-2">
		{#each events as { data, context }}
			<div>
				{#if showDetails}
					<div class="flex gap-1">
						<div>#{context.index_in_slot}</div>
						<div>{context.call_stack.at(-1)}</div>
						<div>{data}</div>
					</div>
				{:else if decodeSmart}
					{@const method = data.startsWith('SWAP:')
						? EventDecoder.decodeSwap
						: data.startsWith('DEPOSITED_TO_BIN:') || data.startsWith('WITHDRAWN_FROM_BIN:')
						? EventDecoder.decodeLiquidity
						: data.startsWith('FEES_COLLECTED:')
						? EventDecoder.decodeLiquidity
						: data.startsWith('TransferSingle:')
						? EventDecoder.decodeLBTransfer
						: EventDecoder.decodeError}
					{EventDecoder.extractParams(data).length ? extractKeyword(data) : null}
					{JSON.stringify(method(data))}
				{:else}
					{EventDecoder.decodeError(data)}
				{/if}
			</div>
		{/each}
	</div>
{/if}
