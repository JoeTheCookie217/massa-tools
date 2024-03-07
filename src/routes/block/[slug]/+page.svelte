<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { providerToChainId, tokenAddresses } from '$lib/utils/methods';
	import clientStore from '$lib/store/client';
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchMasBalance } from '$lib/services/datastore.js';
	import { trpc } from '$lib/trpc/client';

	const query = createQuery({
		queryKey: ['todos'],
		queryFn: () => fetchMasBalance('AU12jWU88jCx8Pr5gptgM3EUfYuoA5g2jCauFRLZyWzEB7WtByTod')
	});
	const blockInfo = trpc.getBlock.createQuery({ blockHash: '' });
	console.log(blockInfo);

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();
	$: selectedNetwork = providerToChainId($clientStore.getPublicProviders()[0]);
</script>

<div>
	{#if $query.isLoading}
		<p>Loading...</p>
	{:else if $query.isError}
		<p>Error: {$query.error.message}</p>
	{:else if $query.isSuccess}
		<p>{$query.data}</p>
	{/if}
</div>
