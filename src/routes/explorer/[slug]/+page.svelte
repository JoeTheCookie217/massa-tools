<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		getAddressLabel,
		isAddress,
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
	import { decodeFeeParameters, decodePairInformation } from '$lib/utils/decoder';
	import CopyButton from '$lib/components/copy-button.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { TokenAmount } from '@dusalabs/sdk';
	import { CHAIN_ID } from '$lib/utils/config.js';

	export let data;
	const { keys, address, isVerified, isToken, isMultisig, balance, erc20Balances } = data;

	// TODO: highlight keys that contain the `connectedAddress`
	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address() ?? '';

	const isPMEntry = (key: string) =>
		key.includes('::') || key.includes('ALLOWANCE') || key.includes('BALANCE');

	let showPersistentMap = false;
	let filter = '';
	$: filteredEntries = filter ? keys.filter((key) => key.includes(filter)) : keys;
	$: displayedEntries = showPersistentMap
		? filteredEntries
		: filteredEntries.filter((key) => !isPMEntry(key));

	let values: Uint8Array[] = [];
	$: values = Array(displayedEntries.length).fill(null);

	const fetchEntry = async (key: string, index: number) => {
		const res = await $clientStore
			.publicApi()
			.getDatastoreEntries([
				{
					address,
					key: strToBytes(key)
				}
			])
			.then((result) => result[0].final_value);
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
					{@const token = tokenAddresses[i][CHAIN_ID]}
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
			<Checkbox id="mintable" bind:checked={showPersistentMap} />
			<Label for="mintable">Show Persistent Map entries</Label>
		</div>
		<div>
			<Input type="text" id="filter" placeholder="Filter by key" bind:value={filter} />
		</div>
	</div>
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
						{:else if key.startsWith('PAIR_INFORMATION')}
							{@const params = decodePairInformation(value)}
							{JSON.stringify(params, undefined, 2)}
						{:else if key.startsWith('FEES_PARAMETERS')}
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
