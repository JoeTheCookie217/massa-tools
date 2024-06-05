<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import useSendTx from '$lib/hooks/useSendTx';
	import { buildDeployMultisig } from '$lib/services/serialize';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import Highlight from 'svelte-highlight';
	import { typescript } from 'svelte-highlight/languages';
	import styles from 'svelte-highlight/styles/an-old-hope';
	import useCopy from '$lib/hooks/useCopy';
	import { isAddress } from '$lib/utils/methods';

	let owners: string[] = [];
	let ownersLength: number = 0;
	let required: number;
	let executionDelay: number = 3600000;
	let upgradeDelay: number = 86400000;
	$: disabled =
		!owners ||
		!required ||
		required > owners.length ||
		required < 1 ||
		owners.some((owner) => !isAddress(owner)) ||
		owners.filter((owner, index) => owners.indexOf(owner) !== index).length > 0; // contains duplicates

	$: defaultOwners = owners;
	$: defaultRequired = required || 2;

	const { send } = useSendTx();

	const increment = () => {
		ownersLength++;
		owners = [...owners, ''];
	};
	const decrement = () => {
		ownersLength--;
		owners = owners.slice(0, ownersLength);
	};

	async function deploy() {
		const deployData = buildDeployMultisig(owners, required, upgradeDelay, executionDelay);
		send(deployData);
	}

	const importPath = '@dusalabs/periphery/assembly/contracts/multisig';

	$: code = `export * from '${importPath}';

import { Args } from '@massalabs/as-types';
import { constructor as _constructor } from '${importPath}';

export function constructor(_: StaticArray<u8>): void {
	const owners: string[] = ${JSON.stringify(defaultOwners, undefined, 2)};
	const required = ${defaultRequired};
	const upgradeDelay = 86_400_000; // 1 day
	const executionDelay = 3_600_000; // 1 hour


	const args = new Args().add(owners).add(required).add(upgradeDelay).add(executionDelay);
	_constructor(args.serialize());
}
	`;

	const { copy, copied } = useCopy();
</script>

<svelte:head>
	<title>Create Multisig</title>
	{@html styles}
</svelte:head>

<div class="flex gap-10">
	<div class="flex flex-col gap-6">
		<div>
			<Label for="required">Required</Label>
			<Input type="number" id="required" placeholder="2" bind:value={required} />
		</div>

		<div>
			<Label>Owners: {owners.length}</Label>
			<Button variant="outline" on:click={increment}>+</Button>
			<Button variant="outline" on:click={decrement} disabled={!ownersLength}>-</Button>
			{#each Array(ownersLength) as _, i}
				<div>
					<Label for="owner">Owner {i + 1}</Label>
					<Input type="text" id="owner" placeholder="0x..." bind:value={owners[i]} />
				</div>
			{/each}
		</div>

		<div>
			<Label for="upgradeDelay">Upgrade Delay</Label>
			<Input type="number" id="upgradeDelay" bind:value={upgradeDelay} />
		</div>

		<div>
			<Label for="executionDelay">Execution Delay</Label>
			<Input type="number" id="executionDelay" bind:value={executionDelay} />
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
