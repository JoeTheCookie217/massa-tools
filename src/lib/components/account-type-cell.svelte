<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let address: string;
</script>

<Tooltip.Root openDelay={50}>
	<Tooltip.Trigger>
		<span>
			{address.startsWith('AU1') ? 'EOA' : 'SC'}
		</span>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<span class="text-xs">
			{address.startsWith('AU1') ? 'Externally Owned Account' : 'Smart Contract'}
		</span>
	</Tooltip.Content>
</Tooltip.Root>
