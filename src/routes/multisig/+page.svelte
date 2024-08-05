<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { trpc } from '$lib/trpc/client';
	import clientStore from '$lib/store/client';
	import {
		clearRecentAddresses,
		getRecentAddresses,
		removeRecentAddress,
		type Address
	} from '$lib/utils/localStorage';
	import { printAddress } from '$lib/utils/methods';

	let address: string;
	let history = getRecentAddresses();

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address() ?? '';
	$: query = trpc.getMultisigs.query(
		{ address: connectedAddress },
		{ enabled: !!connectedAddress }
	);

	const handleClear = () => {
		clearRecentAddresses();
		history = [];
	};

	const handleRemove = (item: Address) => {
		removeRecentAddress(item);
		history = getRecentAddresses();
	};
</script>

<div>
	<div class="flex items-end gap-2">
		<div>
			<Input type="text" placeholder="Multisig address" bind:value={address} />
		</div>
		<Button disabled={!address}>
			<a
				href={`
		/multisig/${address}
	`}>Search</a
			>
		</Button>
	</div>
	<a href="/multisig/create">
		<Button variant="link">Don't have a multisig wallet? Create one</Button>
	</a>

	{#if $query.data}
		<div>
			<div class="flex items-center gap-2">
				<h2>Multisig wallets you're part of</h2>
			</div>
			{#each $query.data as multisig}
				<div class="">
					<span> {multisig.address} </span>
					<a href="/multisig/{multisig.address}">{printAddress(multisig.address)}</a>
				</div>
			{/each}
		</div>
	{/if}

	{#if history.length}
		<div>
			<div class="flex items-center gap-2">
				<h2>Recent addresses</h2>
				<Button variant="link" on:click={handleClear}>Clear</Button>
			</div>
			{#each history as historyItem}
				<div class="">
					{#if historyItem.label}
						<span>
							{historyItem.label}
						</span>
					{/if}

					<a href="/multisig/{historyItem.address}">{printAddress(historyItem.address)}</a>
					<Button variant="ghost" on:click={() => handleRemove(historyItem)}>-</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>
