<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { isEOA } from '$lib/utils/methods';

	export let address: string;
</script>

<Tooltip.Root openDelay={50}>
	<Tooltip.Trigger>
		<span>
			{isEOA(address) ? 'EOA' : 'SC'}
		</span>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<span class="text-xs">
			{isEOA(address) ? 'Externally Owned Account' : 'Smart Contract'}
		</span>
	</Tooltip.Content>
</Tooltip.Root>
