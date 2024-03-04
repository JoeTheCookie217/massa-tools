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
		bytesToU128,
		bytesToArray,
		ArrayTypes
	} from '@massalabs/massa-web3';

	export let value: Uint8Array;
	let decodedValue: string | number | boolean | bigint | {} | undefined = undefined;

	const bytesToStrArray = (arr: Uint8Array) => bytesToArray(arr, ArrayTypes.STRING);
	const bytesToI64Array = (arr: Uint8Array) => bytesToArray(arr, ArrayTypes.I64);
	const bytesToU64Array = (arr: Uint8Array) => bytesToArray(arr, ArrayTypes.U64);
	const bytesToU256Array = (arr: Uint8Array) => bytesToArray(arr, ArrayTypes.U256);

	const methods: Function[] = [
		bytesToStr,
		byteToBool,
		byteToU8,
		byteToU16,
		bytesToU32,
		bytesToU64,
		bytesToU128,
		bytesToU256
	];
	const getLabel = (method: Function) => {
		if (method === bytesToStr) return 'String';
		if (method === byteToBool) return 'Boolean';
		if (method === byteToU8) return 'U8';
		if (method === byteToU16) return 'U16';
		if (method === bytesToU32) return 'U32';
		if (method === bytesToU64) return 'U64';
		if (method === bytesToU128) return 'U128';
		if (method === bytesToU256) return 'U256';
		return '';
	};
	const getMethod = (label: string) =>
		label && methods.find((method) => getLabel(method) === label.replace(' ', ''));

	$: selected = { value: methods[0], label: getLabel(methods[0]) };
	$: {
		const fn = getMethod(selected.label);
		if (fn && value instanceof Uint8Array)
			try {
				decodedValue = fn(value);
			} catch (e) {
				decodedValue = undefined;
				console.log(e);
			}
	}
</script>

<div class="flex items-center gap-2">
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
	{#if decodedValue}
		<span>
			{decodedValue}
		</span>
	{/if}
</div>
