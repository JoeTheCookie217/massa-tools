<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import useSendTx from '$lib/hooks/useSendTx';
	import { buildDeployToken } from '$lib/services/serialize';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Highlight from 'svelte-highlight';
	import { typescript } from 'svelte-highlight/languages';
	// import stylesDark from 'svelte-highlight/styles/tokyo-night-dark';
	// import stylesLight from 'svelte-highlight/styles/tokyo-night-light';
	import styles from 'svelte-highlight/styles/an-old-hope';
	import useCopy from '$lib/hooks/useCopy';
	import { modeCurrent } from '$lib/components/light-switch/light-switch';
	import RedirectModal from './redirect-modal.svelte';

	let tokenAddress: string;

	let name: string;
	let symbol: string;
	let decimals: number;
	let supply: number;
	let mintable = false;
	let burnable = false;
	$: disabled = !name || !symbol || !decimals || !supply;

	const defaultName = 'MyToken';
	const defaultSymbol = 'MYT';
	const defaultDecimals = 9;
	const defaultSupply = 1234;

	const importPath = '@massalabs/sc-standards/assembly/contracts/FT';

	$: code = `export * from '${importPath}/token';${
		mintable
			? `
export * from '${importPath}/token-mint';`
			: ''
	}${
		burnable
			? `
export * from '${importPath}/token-burn';`
			: ''
	}

import * as FT from '${importPath}';
import { Args } from '@massalabs/as-types';
import { u256 } from 'as-bignum/assembly/integer/u256';

export function constructor(_: StaticArray<u8>): void {
	const args = new Args()
		.add('${name || defaultName}')
		.add('${symbol || defaultSymbol}')
		.add(${decimals || defaultDecimals})
		.add(u256.mul(u256.from(${supply || defaultSupply}), u256.from(u64(10 ** ${
		decimals || defaultDecimals
	}))));
	FT.constructor(args.serialize());
}
	`;

	const { copy, copied } = useCopy();

	const { send, subscribe } = useSendTx();
	subscribe((tx) => {
		console.log(tx.events.length);
		if (tx.events.length) tokenAddress = tx.events.at(-1)!.data;
	});

	async function deploy() {
		const totalSupply = BigInt(supply) * BigInt(10 ** decimals);
		const deployData = buildDeployToken(name, symbol, decimals, totalSupply, mintable, burnable);
		send(deployData);
	}
</script>

<svelte:head>
	<title>Create Token - Massa Tools</title>
	<!-- {@html `<style>${modeCurrent ? stylesDark : stylesLight}</style>`} -->
	{@html styles}
</svelte:head>

<div class="flex gap-10">
	{#if tokenAddress}
		<RedirectModal address={tokenAddress} type="token" />
	{/if}
	<div class="grid grid-cols-2">
		<div>
			<Label for="name">Name</Label>
			<Input type="text" id="name" placeholder={defaultName} bind:value={name} />
		</div>
		<div>
			<Label for="symbol">Symbol</Label>
			<Input type="text" id="symbol" placeholder={defaultSymbol} bind:value={symbol} />
		</div>
		<div>
			<Label for="decimals">Decimals</Label>
			<Input
				type="number"
				id="decimals"
				placeholder={defaultDecimals.toString()}
				bind:value={decimals}
			/>
		</div>
		<div>
			<Label for="supply">Supply</Label>
			<Input type="number" id="supply" placeholder={defaultSupply.toString()} bind:value={supply} />
		</div>
		<div>
			<Checkbox id="mintable" bind:checked={mintable} />
			<Label
				for="mintable"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Mintable
			</Label>
		</div>
		<div>
			<Checkbox id="burnable" bind:checked={burnable} />
			<Label
				for="burnable"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Burnable
			</Label>
		</div>
		<Button on:click={deploy} {disabled}>Deploy</Button>
		<Button variant="ghost" on:click={() => copy(code)}>
			{$copied ? 'Copied!' : 'Copy to clipboard'}
		</Button>
	</div>
	<div>
		<Highlight language={typescript} {code} />
	</div>
</div>
