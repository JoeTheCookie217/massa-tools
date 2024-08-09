<script lang="ts">
	import type { TokenAmount } from '@dusalabs/sdk';
	import { Button } from './ui/button';
	import { Input } from './ui/input';

	// mandatory
	export let parsedBalance: TokenAmount;
	export let amount: number;
	export let setMaxAmount: () => void;

	// optional
	export let onClick: () => void = () => {};
	export let text: string = '';
	export let disabled: boolean = false;
</script>

<div class="flex items-center gap-1">
	<div class="relative">
		<Input type="number" placeholder="Amount" id="amount" bind:value={amount} />
		<Button
			class="absolute bottom-0 right-0 text-xs"
			variant="link"
			size="sm"
			on:click={setMaxAmount}>Balance: {parsedBalance.toSignificant(4)}</Button
		>
	</div>
	{#if onClick && text}
		<Button on:click={onClick} {disabled}>{text}</Button>
	{/if}
</div>
