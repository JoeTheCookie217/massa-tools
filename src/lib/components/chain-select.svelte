<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import networkStore from '$lib/store/network';
	import { toTitle, providerToChainId, chainIdToProviders } from '$lib/utils/methods';
	import { ChainId } from '@dusalabs/sdk';

	const chains: ChainId[] = Object.values(ChainId).filter(
		(v) => typeof v === 'number'
	) as ChainId[];
	let selectedNetwork: ChainId;
	networkStore.subscribe((network) => {
		selectedNetwork = providerToChainId(network.getPublicProviders()[0]);
	});
	const changeChain = (chain: ChainId) =>
		networkStore.update((network) => {
			const newProviders = chainIdToProviders(chain);
			localStorage.setItem('defaultPublicApi', newProviders[0].url);
			network.setCustomProviders(newProviders);
			return network;
		});
</script>

<Select.Root onSelectedChange={(c) => changeChain(c)} selected={ChainId[selectedNetwork]}>
	<Select.Trigger class="w-[180px]">
		<Select.Value placeholder="Network" />
	</Select.Trigger>
	<Select.Content>
		{#each chains as chain}
			<Select.Item value={ChainId[chain]}>{toTitle(ChainId[chain].toLowerCase())}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
<!-- <div class="flex flex-col gap-1">
    {#each chains as chain}
        <button
            on:click={() => changeChain(chain)}
            class={`${selectedNetwork === chain && 'text-purple-300'} hover:text-purple-200`}
        >
            {ChainId[chain].toLowerCase()}
        </button>
    {/each}
</div> -->
