<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { clearRecentAddresses, getRecentAddresses } from '$lib/utils/localStorage';

	let address: string;

	let history = getRecentAddresses();

	const handleClear = () => {
		clearRecentAddresses();
		history = [];
	};
</script>

<div>
	<div class="flex items-end gap-2">
		<div>
			<Label for="address">ERC20 Token Address</Label>
			<Input
				type="text"
				id="address"
				placeholder="AS12a1HN9WreQYmxucyLGQ3TSm3s8QYdF72VHG3mJHPLJHakwscFT"
				bind:value={address}
			/>
		</div>
		<Button disabled={!address}>
			<a
				href={`
				/explorer/${address}
			`}>Search</a
			>
		</Button>
	</div>
</div>
{#if history.length}
	<div>
		<div class="flex items-center gap-2">
			<h2>Recent addresses</h2>
			<Button on:click={handleClear}>Clear</Button>
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

				<a href="/{historyItem.address}">{historyItem.address}</a>
			</div>
		{/each}
	</div>
{/if}
