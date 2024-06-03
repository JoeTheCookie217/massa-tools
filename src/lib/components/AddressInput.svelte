<script lang="ts">
	import { isAddress } from '$lib/utils/methods';
	import { Input } from './ui/input';

	export let recipient: string;
	export let valid: boolean;

	$: valid = isAddress(recipient);
</script>

<div class="flex items-center gap-2">
	<div>
		<Input type="text" placeholder="Recipient" id="recipient" bind:value={recipient} />
		{#if !valid && recipient.length > 0}
			<p class="text-red-500 text-xs">Invalid format</p>
		{/if}
	</div>
</div>
