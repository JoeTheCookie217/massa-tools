<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { toTitle, providerToChainId, chainIdToProviders } from '$lib/utils/methods';
	import { ChainId } from '@dusalabs/sdk';
	import { bytesToStr, bytesToU256 } from '@massalabs/massa-web3';

	const methods: Function[] = [bytesToU256, bytesToStr];
	$: selectedMethod = methods[0];

	$: selected = { value: selectedMethod, label: JSON.stringify(selectedMethod) };
	$: {
		if (selected.value !== selectedMethod) {
			// changeChain(selected.value);
		}
	}
</script>

<Select.Root bind:selected>
	<Select.Trigger class="w-[180px]">
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each methods as method}
			<Select.Item value={method} label={JSON.stringify(method)}
				>{JSON.stringify(method)}</Select.Item
			>
		{/each}
	</Select.Content>
</Select.Root>
