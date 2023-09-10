<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button } from '$lib/components/ui/button';
	import useCopy from '$lib/hooks/useCopy';
	import { Copy, Check } from 'lucide-svelte';

	export let copyText: string;

	const { copy, copied } = useCopy();
</script>

<Tooltip.Root openDelay={50}>
	<Tooltip.Trigger>
		<Button on:click={() => copy(copyText)} size="sm" variant="ghost">
			{#if $copied}
				<Check class="h-3 w-3" />
			{:else}
				<Copy class="h-3 w-3" />
			{/if}
		</Button>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<span>
			{#if $copied}
				Copied!
			{:else}
				Copy to clipboard
			{/if}
		</span>
	</Tooltip.Content>
</Tooltip.Root>
