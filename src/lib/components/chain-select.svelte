<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import clientStore from '$lib/store/client';
	import { toTitle, providerToChainId, chainIdToProviders } from '$lib/utils/methods';
	import { ChainId } from '@dusalabs/sdk';

	const chains: ChainId[] = Object.values(ChainId).filter(
		(v) => typeof v === 'number'
	) as ChainId[];
	$: selectedNetwork = providerToChainId($clientStore.getPublicProviders()[0]);

	const changeChain = (chain: ChainId) =>
		clientStore.update((network) => {
			const newProviders = chainIdToProviders(chain);
			localStorage.setItem('defaultPublicApi', newProviders[0].url);
			network.setCustomProviders(newProviders);
			return network;
		});

	$: selected = { value: selectedNetwork, label: toTitle(ChainId[selectedNetwork].toLowerCase()) };
	$: {
		if (selected.value !== selectedNetwork) {
			changeChain(selected.value);
		}
	}
</script>

<Select.Root bind:selected>
	<Select.Trigger class="w-[180px]">
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each chains as chain}
			<Select.Item value={chain} label={toTitle(ChainId[chain].toLowerCase())}
				>{toTitle(ChainId[chain].toLowerCase())}</Select.Item
			>
		{/each}
	</Select.Content>
</Select.Root>
