<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { pollAsyncEvents } from '$lib/services/events';
	import clientStore from '$lib/store/client';
	import { withTimeoutRejection, type IEvent } from '@massalabs/massa-web3';
	import { get } from 'svelte/store';

	const massaClient = get(clientStore);
	let txHash = '';
	let events: IEvent[] = [];

	const handleSearch = async (txId: string) => {
		console.log('handleSearch', txId);
		const {
			isError,
			eventPoller,
			events: e
		} = await withTimeoutRejection(pollAsyncEvents(massaClient, txId), 45_000);
		console.log({ isError, e });
		events = e;
	};

	$: {
		if (txHash) handleSearch(txHash);
	}
</script>

<Input bind:value={txHash} />
{#if events.length}
	{#each events as event}
		<div>
			{JSON.stringify(event)}
		</div>
	{/each}
{/if}
```
