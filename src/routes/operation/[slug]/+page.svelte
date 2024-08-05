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

	const txHash = $page.params.slug;
	$: query = trpc.getOperation.query({ txHash }, { enabled: !!txHash });
	$: console.log(txHash, $query.data?.events);

	$: table = createTable(writable($query.data?.events));
	$: columns = table.createColumns([
		table.column({
			accessor: 'emitterAddress',
			header: 'Address',
			cell: ({ value }) => {
				return createRender(CopyLink, { copyText: value });
			}
		}),
		table.column({
			accessor: 'data',
			header: 'Data',
			cell: ({ value }) => {
				return '';
			}
		})
	]);

	$: model = table.createViewModel(columns);
</script>

{#if $query.isSuccess && $query.data}
	{@const {
		data: { createdAt, blockId, events }
	} = $query}
	<div>
		<p>Timestamp: {dayjs(createdAt).fromNow()}</p>
		<CopyLink copyText={blockId} />
	</div>

	<DataTable {model} />
{:else if $query.isError}
	<p>{$query.error.message}</p>
{:else}
	<p>Loading...</p>
{/if}
