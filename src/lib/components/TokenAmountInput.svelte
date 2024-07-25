<script lang="ts">
	import type { TokenAmount } from '@dusalabs/sdk';
	import { Button } from './ui/button';
	import { Input } from './ui/input';

	export let text: string;
	export let disabled: boolean;
	export let parsedBalance: TokenAmount;
	export let amount: number;
	export let setMaxAmount: () => void;
	export let onClick: () => void;
</script>

<div class="flex items-center gap-2">
	<div>
		<Input type="number" placeholder="Amount" id="amount" bind:value={amount} />
		<Button variant="link" on:click={setMaxAmount}>Balance: {parsedBalance.toSignificant(4)}</Button
		>
	</div>
	<Button on:click={onClick} {disabled}>{text}</Button>
</div>
