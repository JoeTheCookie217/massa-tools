<script lang="ts">
	import { isAddress, isTokenAddress, isTokenSymbol, tokenAddresses } from '$lib/utils/methods';
	import { Input } from './ui/input';
	import { goto } from '$app/navigation';

	let value: string;
	let focus = false;

	const redirect = (value: string) => {
		if (isTokenSymbol(value) || isTokenAddress(value)) {
			goto(`/token/${value}`);
			value = '';
		} else if (isAddress(value)) {
			goto(`/explorer/${value}`);
			value = '';
		} else if (value.startsWith('O1')) {
			goto(`/event/${value}`);
			value = '';
		}
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			redirect(value);
		}
	};

	const onClick = (value: string) => {
		redirect(value);
	};
</script>

<div class="grow relative">
	<Input
		type="text"
		placeholder="Search by address, transaction hash or token"
		bind:value
		on:keydown={onKeyDown}
		on:focus={() => (focus = true)}
		on:blur={() => (focus = false)}
	/>
	{#if focus}
		<div class="absolute inset-x-0 top-full">
			<div class="">Examples:</div>
			{#each tokenAddresses as token}
				<div class="text-sm text-gray-500" on:click={() => onClick(token.address)}>
					{token.address}
				</div>
			{/each}
		</div>
	{/if}
</div>
