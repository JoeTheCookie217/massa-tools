<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import {
		bytesToStr,
		bytesToU256,
		byteToBool,
		byteToU16,
		byteToU8,
		bytesToU32,
		bytesToU64,
		bytesToU128
	} from '@massalabs/massa-web3';

	export let value: Uint8Array;
	type X = { value: Function; label: string };

	const methods: Function[] = [
		bytesToU256,
		bytesToStr,
		byteToBool,
		byteToU16,
		byteToU8,
		bytesToU32,
		bytesToU64,
		bytesToU128
	];
	$: selected = { value: (arr: Uint8Array): any => {}, label: getLabel(methods[0]) };

	const getLabel = (method: Function) => method.name.split('To')[1];

	$: {
		console.log(selected.value.name);
		if (selected.value.name) {
			value = selected.value(value);
		}
	}
</script>

<Select.Root bind:selected>
	<Select.Trigger class="w-[180px]">
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each methods as method}
			<Select.Item value={method} label={getLabel(method)}>{getLabel(method)}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
