<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		getAddressLabel,
		isAddress,
		LB_FACTORY_ADDRESS,
		printAddress,
		printMasBalance,
		printUint8Array,
		tokenAddresses
	} from '$lib/utils/methods';
	import clientStore from '$lib/store/client';

	import { onMount } from 'svelte';
	import { addRecentAddress } from '$lib/utils/localStorage';
	// import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Table from '$lib/components/ui/table';
	import {
		Args,
		byteToU8,
		bytesToStr,
		bytesToU256,
		strToBytes,
		toMAS
	} from '@massalabs/massa-web3';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import DecodeSelect from '$lib/components/decode-select.svelte';
	import AddressCell from '$lib/components/address-cell.svelte';
	import { decodeFeeParameters, decodePairInformation, decodePreset } from '$lib/utils/decoder';
	import CopyButton from '$lib/components/copy-button.svelte';
	import { TokenAmount } from '@dusalabs/sdk';
	import { getLargeDatastoreKeys } from '$lib/services/datastore';
	import { trpc } from '$lib/trpc/client';
	import { createTable, createRender } from 'svelte-headless-table';
	import { writable } from 'svelte/store';
	import CopyLink from '$lib/components/copy-link.svelte';
	import DataTable from '$lib/components/data-table.svelte';

	export let data;
	// prettier-ignore
	const { keys: k, address, isVerified, isToken, isMultisig, balance, erc20Balances, tooBig } = data;

	// TODO: highlight keys that contain the `connectedAddress`
	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address() ?? '';

	$: query = trpc.getTxs.query({ address });
	$: operations = $query.data || [];

	$: operationTable = createTable(writable(operations));
	$: operationColumns = operationTable.createColumns([
		operationTable.column({
			accessor: 'targetAddress',
			header: 'Smart contract',
			cell: ({ value }) => createRender(CopyLink, { copyText: value })
		}),
		operationTable.column({
			accessor: 'targetFunction',
			header: 'Method'
		}),
		operationTable.column({
			accessor: 'callerAddress',
			header: 'Caller',
			cell: ({ value }) => createRender(CopyLink, { copyText: value })
		}),
		// operationTable.column({
		// 	accessor: 'data',
		// 	header: 'Data',
		// 	cell: ({ value }) => bytesToStr(Uint8Array.from(value.data))
		// }),
		operationTable.column({
			accessor: 'value',
			header: 'Value',
			cell: ({ value }) => printMasBalance(toMAS(value).toFixed(2))
		})
	]);
	$: operationModel = operationTable.createViewModel(operationColumns);

	const isPMEntry = (key: string) =>
		key.includes('::') || key.includes('ALLOWANCE') || key.includes('BALANCE');

	const separator = '::';
	let prefixes = k
		.map((key) => (key.includes(separator) ? key.split(separator)[0] : ''))
		.filter((v, i, a) => v && a.indexOf(v) === i);
	let prefixFilters = prefixes.map((p) => false);

	// : entries.filter(
	// 		({ key }) => !(key.includes('::') || key.includes('ALLOWANCE') || key.includes('BALANCE'))
	//   );

	let showPersistentMap = false;
	let keys = k;
	let filter = '';
	$: filteredEntries = filter ? keys.filter((key) => key.includes(filter)) : keys;
	$: displayedEntries = showPersistentMap
		? filteredEntries
		: filteredEntries.filter((key) => !isPMEntry(key));

	// $: displayedEntries = k.filter((key ) =>
	// 	key.includes(separator) ? prefixFilters[prefixes.indexOf(key.split(separator)[0])] : true
	// );

	$: {
		if (tooBig) {
			if (!filter.length) keys = [];
			else getLargeDatastoreKeys(address, filter).then((res) => (keys = res));
		}
	}

	let values: Uint8Array[] = [];
	$: values = Array(displayedEntries.length).fill(null);

	const fetchEntry = async (key: string, index: number) => {
		const res = await new IBaseContract(address, $clientStore)
			.publicApi()
			.getDatastoreEntries([
				{
					address,
					key: strToBytes(key)
				}
			])
			.then((result) => result[0].candidate_value);
		if (res) values[index] = res;
	};

	const save = (label: string) =>
		addRecentAddress({
			address,
			label,
			type: 'address'
		});
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-2">
			<h2 class="text-2xl">Information</h2>
			<div class="flex items-center gap-2">
				<span>
					{printAddress(address)}
				</span>
				<CopyButton copyText={address} />
				<span>{printMasBalance(toMAS(balance).toFixed(2))}</span>
				{#each erc20Balances as b, i}
					{@const token = tokenAddresses[i]}
					{#if b > 0 && b < 2n ** 256n - 1n}
						<span>{new TokenAmount(token, b).toSignificant()} {token.symbol}</span>
					{/if}
				{/each}
			</div>
			{#if isVerified}
				<div class="text-sm">
					<span class="text-green-500 pr-1">Verified</span>{getAddressLabel(address)}
				</div>
			{/if}
			{#if isToken}
				<a href={`/token/${address}`}>
					<div class="text-sm underline">Token page</div>
				</a>
			{/if}
			{#if isMultisig}
				<a href={`/multisig/${address}`}>
					<div class="text-sm underline">Multisig page</div>
				</a>
			{/if}
		</div>
	</div>

	<h2 class="text-2xl">Datastore</h2>
	<div class="flex items-end gap-2">
		<div>
			<Label
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Show Persistent Map entries
			</Label>
			<div class="flex flex-col gap-1">
				{#each prefixes as prefix, i}
					<div>
						<Checkbox id={`mintable${i}`} bind:checked={prefixFilters[i]} />
						<Label
							for={`mintable${i}`}
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{prefix}
						</Label>
					</div>
				{/each}
			</div>
		</div>
	</div>

	{#if tooBig}
		<div class="text-center text-sm">Too many keys to display. Please specify a prefix</div>
	{/if}

	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>#</Table.Head>
				<Table.Head>Key</Table.Head>
				<Table.Head class="text-center">Value</Table.Head>
				<Table.Head>Decode</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each displayedEntries as key, i}
				{@const value = values[i]}
				<Table.Row>
					<Table.Cell>{i + 1}</Table.Cell>
					<Table.Cell>{key}</Table.Cell>
					<Table.Cell>
						{#if !value}
							<Button variant="ghost" on:click={() => fetchEntry(key, i)}>Fetch</Button>
						{:else}
							{printUint8Array(value)}
							<CopyButton copyText={value.toString()} />
						{/if}
					</Table.Cell>
					<Table.Cell>
						{#if !value}
							&nbsp;
						{:else if key.startsWith('PAIR_INFORMATION::') && address === LB_FACTORY_ADDRESS}
							{@const params = decodePreset(value)}
							{JSON.stringify(params, undefined, 2)}
						{:else if key.startsWith('PAIR_INFORMATION')}
							{@const params = decodePairInformation(value)}
							{JSON.stringify(params, undefined, 2)}
						{:else if key === 'FEES_PARAMETERS'}
							{@const params = decodeFeeParameters(value)}
							{JSON.stringify(params, undefined, 2)}
						{:else if key.startsWith('accrued_debts::')}
							{@const args = new Args(value)}
							{@const debtX = args.nextU256()}
							{@const debtY = args.nextU256()}
							{JSON.stringify({ debtX, debtY }, undefined, 2)}
						{:else if key.startsWith('bin::')}
							{@const args = new Args(value)}
							{@const reserveX = args.nextU256()}
							{@const reserveY = args.nextU256()}
							{@const accTokenXPerShare = args.nextU256()}
							{@const accTokenYPerShare = args.nextU256()}
							{JSON.stringify(
								{ reserveX, reserveY, accTokenXPerShare, accTokenYPerShare },
								undefined,
								2
							)}
						{:else}
							<DecodeSelect {value} />
						{/if}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

{#if $query.isSuccess && $query.data}
	<h2>Operations</h2>
	<DataTable model={operationModel} />
	<br />
	<br />
{:else if $query.isError}
	<p>{$query.error.message}</p>
{:else}
	<p>Loading...</p>
{/if}
