<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { printAddress } from '$lib/utils/methods';

	export let owners: string[];
	export let selectedOwner: string;

	let selected = { value: '', label: '' };

	$: {
		selectedOwner = selected.value;
	}
</script>

<Select.Root bind:selected>
	<Select.Trigger>
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each owners as owner}
			<Select.Item value={owner}>{printAddress(owner)}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
