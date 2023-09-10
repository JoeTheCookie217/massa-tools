<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import useCopy from '$lib/hooks/useCopy';

	export let copyText: string;

	const { copy, copied } = useCopy(copyText);
</script>

<Button on:click={copy} variant="ghost">
	{copied ? 'Copied!' : 'Copy'}
</Button>
