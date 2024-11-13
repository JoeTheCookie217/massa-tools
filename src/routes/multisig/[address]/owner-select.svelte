<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { printAddress } from '$lib/utils/methods';

	interface Props {
		owners: string[];
		selectedOwner: string;
	}

	let { owners, selectedOwner }: Props = $props();

	let selected = $state({ value: '', label: '' });

	$effect(() => {
		selectedOwner = selected.value;
	});
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
