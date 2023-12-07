<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { printAddress } from '$lib/utils/methods';
	import CopyButton from './copy-button.svelte';

	export let address: string;
</script>

<Table.Cell class="flex items-center gap-2">
	<Tooltip.Root openDelay={50}>
		<Tooltip.Trigger>
			<a href={`/explorer/${address}`}>
				{printAddress(address, 8)}
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<span class="text-xs">
				{address}
			</span>
		</Tooltip.Content>
	</Tooltip.Root>
	<CopyButton copyText={address} />
</Table.Cell>
