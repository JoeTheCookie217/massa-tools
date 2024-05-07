<script lang="ts">
	import { isAddress, isToken } from '$lib/utils/methods';
	import { Input } from './ui/input';
	import { goto } from '$app/navigation';

	let address: string;

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			const value = (event.target as HTMLInputElement).value;
			console.log('Enter key pressed', value);
			if (isToken(value)) {
				address = '';
				goto(`/token/${value}`);
			} else if (isAddress(value)) {
				address = '';
				goto(`/explorer/${value}`);
			} else if (value.startsWith('O1')) {
				address = '';
				goto(`/event/${value}`);
			}
		}
	};
</script>

<div>
	<Input
		type="text"
		placeholder="Smart contract/user address"
		bind:value={address}
		on:keydown={onKeyDown}
	/>
</div>
