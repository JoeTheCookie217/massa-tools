<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		clearRecentAddresses,
		getRecentAddresses,
		removeRecentAddress,
		type Address
	} from '$lib/utils/localStorage';

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
			<Input type="text" placeholder="ERC20 token address" bind:value={address} />
		</div>
		<Button disabled={!address}>
			<a
				href={`
				/token/${address}
			`}>Search</a
			>
		</Button>
	</div>
	<a href="/create">
		<Button variant="link">Want your own token? Create one</Button>
	</a>
	{#if history.length}
		<div>
			<div class="flex items-center gap-2">
				<h2>Recent addresses</h2>
				<Button variant="link" on:click={handleClear}>Clear</Button>
			</div>
			{#each history as historyItem}
				<div>
					{#if historyItem.name}
						<span>
							{historyItem.name}
						</span>
					{/if}
					{#if historyItem.symbol}
						<span>
							{historyItem.symbol}
						</span>
					{/if}

					<a href="/explorer/{historyItem.address}">{historyItem.address}</a>
					<Button variant="ghost" on:click={() => handleRemove(historyItem)}>-</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>
