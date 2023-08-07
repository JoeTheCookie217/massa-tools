<script lang="ts">
	import type { MyPageLoad } from './+page';

	export let data: MyPageLoad;
</script>

<h1>{data.properties.address}</h1>

<!-- <h1>
	Contract address: {address}
</h1>

{#await getDatastore()}
	<p>loading...</p>
{:then}
	{#if properties}
		<h2 class="text-6xl">Properties</h2>
		<p>Symbol: {properties.symbol}</p>
		<p>Name: {properties.name}</p>
		<p>
			Total supply: {(properties.totalSupply / 10n ** BigInt(properties.decimals)).toLocaleString()}
			({properties.decimals}
			decimals)
		</p>
		<p>Owner: {properties.owner}</p>
		<p>Holders: {balances.length}</p>
		{#if balances.length > 0}
			<h2>Balances</h2>
			{#each balances as { address, value }}
				{@const balance = Number(value / 10n ** BigInt(properties.decimals))}
				{@const share =
					(balance / Number(properties.totalSupply / 10n ** BigInt(properties.decimals))) * 100}
				<p>
					{address}: {balance.toLocaleString()} ({share.toFixed(4)}%)
				</p>
			{/each}
		{/if}
	{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await} -->
