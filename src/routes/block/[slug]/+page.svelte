<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { bytesToStr, toMAS } from '@massalabs/massa-web3';
	import { printMasBalance } from '$lib/utils/methods';
	import { readable } from 'svelte/store';
	import { createRender, createTable } from 'svelte-headless-table';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import CopyLink from '$lib/components/copy-link.svelte';
	import DataTable from '$lib/components/data-table.svelte';

	const blockHash = $page.params.slug;
	const query = trpc.getBlock.query({ blockHash });
	const operations = $query.data?.operations || [];
	const ledgerChanges = $query.data?.ledgerChanges || [];

	const operationTable = createTable(readable(operations));
	const operationColumns = operationTable.createColumns([
		operationTable.column({
			accessor: 'targetAddress',
			header: 'Smart contract',
			cell: ({ value }) => {
				return createRender(CopyLink, { copyText: value });
			}
		}),
		operationTable.column({
			accessor: 'targetFunction',
			header: 'Method'
		}),
		operationTable.column({
			accessor: 'callerAddress',
			header: 'Caller',
			cell: ({ value }) => {
				return createRender(CopyLink, { copyText: value });
			}
		}),
		operationTable.column({
			accessor: 'data',
			header: 'Data',
			cell: ({ value }) => {
				return bytesToStr(Uint8Array.from(value.data));
			}
		}),
		operationTable.column({
			accessor: 'value',
			header: 'Value',
			cell: ({ value }) => {
				return printMasBalance(toMAS(value).toFixed(2));
			}
		})
	]);
	const operationModel = operationTable.createViewModel(operationColumns);

	const ledgerChangeTable = createTable(readable(ledgerChanges));
	const ledgerChangeColumns = ledgerChangeTable.createColumns([
		ledgerChangeTable.column({
			accessor: 'address',
			header: 'Address',
			cell: ({ value }) => {
				return createRender(CopyLink, { copyText: value });
			}
		}),
		ledgerChangeTable.column({
			accessor: 'key',
			header: 'Key',
			cell: ({ value }) => {
				return bytesToStr(Uint8Array.from(value.data));
			}
		}),
		ledgerChangeTable.column({
			accessor: 'value',
			header: 'Value',
			cell: ({ value }) => {
				return bytesToStr(Uint8Array.from(value.data));
			}
		})
	]);
	const ledgerChangeModel = ledgerChangeTable.createViewModel(ledgerChangeColumns);
</script>

{#if $query.isSuccess && $query.data}
	<div>
		<p>Timestamp: {$query.data.createdAt}</p>
		<p>Period: {$query.data.period}</p>
		<p>Thread: {$query.data.thread}</p>
		<p>Operations: {$query.data.operations.length}</p>
		<p>Ledger changes: {$query.data.ledgerChanges.length}</p>
	</div>

	<h2>Operations</h2>
	<DataTable model={operationModel} />
	<br />

	<h2>Ledger changes</h2>
	<DataTable model={ledgerChangeModel} />
	<br />
{:else if $query.isError}
	<p>{$query.error.message}</p>
{:else}
	<p>Loading...</p>
{/if}
