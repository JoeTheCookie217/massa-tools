<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		getAddressLabel,
		isAddress,
		printAddress,
		printMasBalance,
		providerToChainId,
		tokenAddresses
	} from '$lib/utils/methods';
	import clientStore from '$lib/store/client';

	import { onMount } from 'svelte';
	import { addRecentAddress } from '$lib/utils/localStorage';
	// import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Args, byteToU8, bytesToStr, bytesToU256, toMAS } from '@massalabs/massa-web3';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import DecodeSelect from '$lib/components/decode-select.svelte';
	import AddressCell from '$lib/components/address-cell.svelte';
	import { decodeFeeParameters, decodePairInformation } from '$lib/utils/decoder';
	import CopyButton from '$lib/components/copy-button.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { TokenAmount } from '@dusalabs/sdk';

	export let data;
	const { entries, address, isVerified, isToken, balance, erc20Balances } = data;

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();
	$: selectedNetwork = providerToChainId($clientStore.getPublicProviders()[0]);

	let showPersistentMap = false;
	$: displayedEntries = showPersistentMap
		? entries
		: entries.filter(
				({ key }) => !key.includes('::') && !key.includes('ALLOWANCE') && !key.includes('BALANCE')
		  );

	onMount(() => {
		addRecentAddress({
			address,
			chainId: selectedNetwork
		});
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
					{@const token = tokenAddresses[i][selectedNetwork]}
					{#if b > 0 && b < 2n ** 256n - 1n}
						<span>{new TokenAmount(token, b).toSignificant()} {token.symbol}</span>
					{/if}
				{/each}
			</div>
			{#if isVerified}
				<div class="text-sm text-green-500">Verified</div>
				<div class="text-sm">{getAddressLabel(address)}</div>
			{/if}
			{#if isToken}
				<a href={`/token/${address}`}>
					<div class="text-sm underline">Token page</div>
				</a>
			{/if}
		</div>
	</div>

	{#if displayedEntries.length > 0}
		<h2 class="text-2xl">Datastore</h2>
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
					<Table.Head>Decode</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each displayedEntries as { key, value }, i}
					<Table.Row>
						<Table.Cell>{key}</Table.Cell>
						{#if key.startsWith('PAIR_INFORMATION')}
							{@const params = decodePairInformation(value)}
							<Table.Cell>
								{JSON.stringify(params, undefined, 2)}
							</Table.Cell>
						{:else if key.startsWith('FEES_PARAMETERS')}
							{@const params = decodeFeeParameters(value)}
							<Table.Cell>
								{JSON.stringify(params, undefined, 2)}
							</Table.Cell>
							<!-- {:else if isAddress(strValue)}
								<AddressCell address={strValue} />
							-->
						{:else}
							<Table.Cell>
								<Textarea value={value.toString()} />
							</Table.Cell>
						{/if}
						<Table.Cell>
							<DecodeSelect {value} />
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</div>
