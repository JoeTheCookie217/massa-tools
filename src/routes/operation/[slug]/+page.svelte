<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { bytesToStr } from '@massalabs/massa-web3';
	import { EventDecoder } from '@dusalabs/sdk';
	import { writable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import CopyLink from '$lib/components/copy-link.svelte';
	import DataTable from '$lib/components/data-table.svelte';
	import CopyButton from '$lib/components/copy-button.svelte';

	const txHash = $page.params.slug;
	$: query = trpc.getOperation.query({ txHash }, { enabled: !!txHash });
	type X = keyof NonNullable<typeof $query.data>;

	$: console.log(txHash, $query.data?.events);

	$: table = createTable(writable($query.data?.events));
	$: columns = table.createColumns([
		table.column({
			accessor: 'emitterAddress',
			header: 'Address',
			cell: ({ value }) => createRender(CopyLink, { copyText: value })
		}),
		table.column({
			accessor: 'data',
			header: 'Data',
			cell: ({ value }) => {
				const strEvent = bytesToStr(Uint8Array.from(value.data));
				if (strEvent.startsWith('SWAP:')) {
					return JSON.stringify(EventDecoder.decodeSwap(strEvent));
				} else if (
					strEvent.startsWith('DEPOSITED_TO_BIN:') ||
					strEvent.startsWith('WITHDRAWN_FROM_BIN:')
				) {
					return JSON.stringify(EventDecoder.decodeLiquidity(strEvent));
				} else {
					return strEvent;
				}
			}
		})
	]);

	$: model = table.createViewModel(columns);

	// hide certain values in output from JSON.stringify
	// https://stackoverflow.com/questions/4910567/hide-certain-values-in-output-from-json-stringify
	function replacer(key: X, value: any) {
		const dismissKeys: X[] = ['createdAt', 'blockId', 'id', 'events'];
		if (dismissKeys.includes(key)) return undefined;
		else return value;
	}
</script>

{#if $query.isSuccess && $query.data}
	{@const {
		data: { createdAt, blockId }
	} = $query}
	<div>
		<p>Timestamp: {dayjs(createdAt).fromNow()}</p>
		<div>{JSON.stringify($query.data, replacer, 4)}</div>

		<CopyButton copyText={txHash} />
		<CopyLink copyText={blockId} />
	</div>

	<DataTable {model} />
{:else if $query.isError}
	<p>{$query.error.message}</p>
{:else}
	<p>Loading...</p>
{/if}
