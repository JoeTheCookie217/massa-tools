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
	let decodedValue: string | number | boolean | bigint | {} | undefined;

	const methods: Function[] = [
		// () => value,
		bytesToStr,
		byteToBool,
		byteToU8,
		byteToU16,
		bytesToU32,
		bytesToU64,
		bytesToU128,
		bytesToU256
	];
	const getLabel = (method: Function) => method.name.split('To')[1];
	const getMethod = (label: string) =>
		methods.find((method) => getLabel(method) === label.replace(' ', ''));

	$: selected = { value: methods[0], label: getLabel(methods[0]) };
	$: {
		const fn = getMethod(selected.label);
		if (fn && value instanceof Uint8Array)
			try {
				decodedValue = fn(value);
			} catch (e) {
				decodedValue = value;
				console.log(e);
			}
	}
</script>

<Select.Root bind:selected>
	<Select.Trigger class="w-[180px]">
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each methods as method}
			<Select.Item value={getLabel(method)}>{getLabel(method)}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
{decodedValue}
