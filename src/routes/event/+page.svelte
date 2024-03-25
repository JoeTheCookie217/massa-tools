<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import { fetchEvents } from '$lib/services/datastore';
	import clientStore from '$lib/store/client';
	import { EventDecoder } from '@dusalabs/sdk';
	import type { IEvent } from '@massalabs/massa-web3';
	import { get } from 'svelte/store';

	let txHash = '';
	let events: IEvent[] = [];
	let showDetails = false;

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

<div class="flex gap-2">
	<Label for="details">Show details</Label>
	<Checkbox id="details" bind:checked={showDetails} />
</div>
{#if events.length}
	{#each events as event}
		{#if showDetails}
			<div>
				{JSON.stringify(event, null, 2)}
			</div>
		{:else}
			<div>
				{EventDecoder.decodeError(event.data)}
			</div>
		{/if}
	{/each}
{/if}
