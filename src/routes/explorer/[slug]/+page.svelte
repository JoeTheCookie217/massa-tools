<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { printAddress, providerToChainId } from '$lib/utils/methods';
	import clientStore from '$lib/store/client';

	import { onMount } from 'svelte';
	import { addRecentAddress } from '$lib/utils/localStorage';
	// import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Table from '$lib/components/ui/table';
	import { bytesToStr, bytesToU256 } from '@massalabs/massa-web3';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';

	export let data;
	const { entries, address } = data;

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();
	$: selectedNetwork = providerToChainId($clientStore.getPublicProviders()[0]);

	let showPersistentMap = false;
	$: displayedEntries = showPersistentMap
		? entries
		: entries.filter(({ key }) => !key.includes('::'));

	onMount(() => {
		addRecentAddress({
			address,
			chainId: selectedNetwork
		});
	});
</script>

<div class="flex flex-col gap-4">
	{#if displayedEntries.length > 0}
		<h2 class="text-2xl">Entries</h2>
		<div>
			<Checkbox id="mintable" bind:checked={showPersistentMap} />
			<Label
				for="mintable"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Show Persistent Map entries
			</Label>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Key</Table.Head>
					<Table.Head>Value</Table.Head>
					<Table.Head class="w-[50px] text-right">Type</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each displayedEntries as { key, value }, i}
					<!-- try using bytesToU256 and if error, use bytesToStr instead -->
					{#if value}
						{#await Promise.resolve(bytesToStr(value)) then strValue}
							<Table.Row>
								<Table.Cell>{key}</Table.Cell>
								<Table.Cell>{strValue}</Table.Cell>
							</Table.Row>
						{:catch err}
							<Table.Row>
								<Table.Cell>{key}</Table.Cell>
								<Table.Cell>{value}</Table.Cell>
							</Table.Row>
						{/await}
					{/if}
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</div>
