<script lang="ts">
	import { Input } from './ui/input';

	let address: string;

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			console.log('Enter key pressed');
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
