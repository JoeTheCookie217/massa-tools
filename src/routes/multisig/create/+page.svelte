<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildDeployMultisig } from '$lib/services/serialize';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import Highlight from 'svelte-highlight';
	import { typescript } from 'svelte-highlight/languages';
	import styles from 'svelte-highlight/styles/dracula';

	let owners: string[] = [];
	let ownersLength: number = 0;
	let required: number;
	$: disabled = !owners || !required;

	$: defaultOwners = owners.length ? owners : ['0x...'];
	$: defaultRequired = required || 2;

	const { send, subscribe } = sendTx();
	subscribe((txState) => {
		console.log(txState);
	});

	const increment = () => {
		ownersLength++;
		owners = [...owners, ''];
	};
	const decrement = () => {
		ownersLength--;
		owners = owners.slice(0, ownersLength);
	};

	async function deploy() {
		const deployData = buildDeployMultisig(owners, required);
		send(deployData);
	}

	$: code = `export * from '@dusalabs/periphery/assembly/contracts/multisig';

import * as MS from '@dusalabs/periphery/assembly/contracts/multisig';
export function constructor(_: StaticArray<u8>): void {
	const owners = ${JSON.stringify(defaultOwners)};
	const required = ${defaultRequired};

	const args = new Args().add(owners).add(required);
	MS.constructor(args);
}
	`;

	const copy = () => navigator.clipboard.writeText(code);
</script>

<svelte:head>
	<title>Create Multisig</title>
	{@html styles}
</svelte:head>

<div class="flex">
	<div class="">
		<div>
			<Label for="required">Required</Label>
			<Input type="number" id="required" placeholder="2" bind:value={required} />
		</div>
		<Button variant="ghost" on:click={increment}>+</Button>
		<Button variant="ghost" on:click={decrement}>-</Button>
		{#each Array(ownersLength) as _, i}
			<div>
				<Label for="owner">Owner {i + 1}</Label>
				<Input type="text" id="owner" placeholder="0x..." bind:value={owners[i]} />
			</div>
		{/each}
		<Button on:click={deploy} {disabled}>Deploy</Button>
	</div>
	<div>
		<Button on:click={copy}>Copy to clipboard</Button>
		<Highlight language={typescript} {code} />
	</div>
</div>
