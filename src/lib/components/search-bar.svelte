<script lang="ts">
	import { isToken } from '$lib/utils/methods';
	import { Input } from './ui/input';
	import { goto } from '$app/navigation';

	let search: string;

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		const value = (event.target as HTMLInputElement).value;
		console.log('Enter key pressed', value);
		if (isToken(value)) {
			search = '';
			goto(`/token/${value}`);
		} else if (value.startsWith('O1')) {
			search = '';
			goto(`/event/${value}`);
		} else {
			search = '';
			goto(`/explorer/${value}`);
		}
	};
</script>

<div class="grow">
	<Input
		type="text"
		placeholder="Search by address, transaction hash or token"
		bind:value={search}
		on:keydown={onKeyDown}
	/>
</div>
