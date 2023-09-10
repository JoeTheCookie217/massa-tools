<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		clearRecentMultisigs,
		getRecentMultisigs,
		removeRecentMultisig
	} from '$lib/utils/localStorage';

	let address: string;
	let history = getRecentMultisigs();

	const handleClear = () => {
		clearRecentMultisigs();
		history = [];
	};

	const handleRemove = (item: string) => {
		removeRecentMultisig(item);
		history = getRecentMultisigs();
	};
</script>

<div>
	<div class="flex items-end gap-2">
		<div>
			<Label for="address">Multisig Address</Label>
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
		/multisig/${address}
	`}>Search</a
			>
		</Button>
	</div>
	<a href="/multisig/create">
		<Button variant="link">Don't have a multisig wallet? Create one</Button>
	</a>

	{#if history.length}
		<div>
			<div class="flex items-center gap-2">
				<h2>Recent addresses</h2>
				<Button variant="link" on:click={handleClear}>Clear</Button>
			</div>
			{#each history as historyItem}
				<div>
					<a href="/multisig/{historyItem}">{historyItem}</a>
					<Button variant="ghost" on:click={() => handleRemove(historyItem)}>-</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>
