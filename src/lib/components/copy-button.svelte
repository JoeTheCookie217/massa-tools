<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import useCopy from '$lib/hooks/useCopy';
	import { Copy, Check } from 'lucide-svelte';

	export let copyText: string;

	const { copy, copied } = useCopy();
</script>

<Button on:click={() => copy(copyText)} size="sm" variant="ghost">
	{#if $copied}
		<Check class="h-3 w-3" />
	{:else}
		<Copy class="h-3 w-3" />
	{/if}
</Button>
