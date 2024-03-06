<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { providerToChainId, tokenAddresses } from '$lib/utils/methods';
	import clientStore from '$lib/store/client';

	export let data;
	const {} = data;

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();
	$: selectedNetwork = providerToChainId($clientStore.getPublicProviders()[0]);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-2">
			<h2 class="text-2xl">Information</h2>
			<div class="flex items-center gap-2" />
		</div>
	</div>
</div>
