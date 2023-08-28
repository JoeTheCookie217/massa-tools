<script lang="ts">
	import Button from '../../components/button.svelte';
	import { clearRecentAddresses, getRecentAddresses } from '../../utils/localStorage';

	let address: string;

	let history = getRecentAddresses();

	const handleClear = () => {
		clearRecentAddresses();
		history = [];
	};
</script>

<div>
	<input bind:value={address} />
	<button>
		<a href="/{address}">Search address</a>
	</button>
</div>
{#if history.length}
	<div>
		<div class="flex items-center gap-2">
			<h2>Recent addresses</h2>
			<Button text="Clear" onClick={handleClear} />
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
