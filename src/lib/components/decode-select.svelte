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
	const bytesToSerializable = (arr: Uint8Array) => ({});

	const methods: Function[] = [
		bytesToStr,
		byteToBool,
		byteToU8,
		byteToU16,
		bytesToU32,
		bytesToU64,
		//bytesToU128,
		bytesToU256,
		bytesToStrArray,
		bytesToI64Array,
		bytesToU64Array,
		bytesToU256Array,
		bytesToSerializable
	];
	const getLabel = (method: Function) => {
		try {
			return method.name.split('To')[1];
		} catch (error) {
			return '';
		}
	};
	const getMethod = (label: string) =>
		methods.find((method) => getLabel(method) === label.replace(' ', ''));

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
