<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		clearRecentAddresses,
		getRecentAddresses,
		removeRecentAddress,
		type Address
	} from '$lib/utils/localStorage';
	import { printAddress } from '$lib/utils/methods';
	import { LB_FACTORY_ADDRESS } from '@dusalabs/sdk';

	let address: string;

	let history = getRecentAddresses();

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
			<Input type="text" placeholder="Smart contract/user address" bind:value={address} />
		</div>
		<Button disabled={!address}>
			<a
				href={`
				/explorer/${address}
			`}>Search</a
			>
		</Button>
	</div>

	<div class="flex">
		<div>Popular addresses</div>
		<div>
			<div>Dusa Core</div>
			<div>
				<span> Factory </span>
				<a href="/explorer/${LB_FACTORY_ADDRESS}" class="text-blue-500" />
			</div>
		</div>
	</div>

	{#if history.length}
		<div class="mt-4">
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

					<a href="/explorer/{historyItem.address}">{printAddress(historyItem.address)}</a>
					<Button variant="ghost" on:click={() => handleRemove(historyItem)}>-</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>
