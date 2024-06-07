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
	import AddressInput from '$lib/components/AddressInput.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);

	let owners: string[] = [];
	let validOwners: boolean[] = [];
	let ownersLength: number = 0;
	let required: number;
	let executionDelay: number = 3600000;
	let upgradeDelay: number = 86400000;
	$: disabledText =
		(!owners && 'No owners set') ||
		(!required && 'No requirement set') ||
		required > owners.length ||
		required < 1 ||
		validOwners.some((valid) => !valid) ||
		owners.some((owner) => !isAddress(owner)) ||
		owners.filter((owner, index) => owners.indexOf(owner) !== index).length > 0; // contains duplicates
	$: disabled = !!disabledText;

	$: defaultOwners = owners;
	$: defaultRequired = required || 2;

	const { send } = useSendTx();

	const increment = () => {
		ownersLength++;
		owners = [...owners, ''];
		validOwners = [...validOwners, false];
	};
	const decrement = () => {
		ownersLength--;
		owners = owners.slice(0, ownersLength);
		validOwners = validOwners.slice(0, ownersLength);
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
	const upgradeDelay = ${upgradeDelay};
	const executionDelay = ${executionDelay};


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
					<AddressInput bind:recipient={owners[i]} bind:valid={validOwners[i]} />
				</div>
			{/each}
		</div>

		<div>
			<Label for="upgradeDelay">Upgrade Delay (in ms)</Label>
			<Input type="number" id="upgradeDelay" bind:value={upgradeDelay} />
			<span class="text-xs">{dayjs(Date.now() + Number(upgradeDelay)).fromNow(true)}</span>
		</div>

		<div>
			<Label for="executionDelay">Execution Delay (in ms)</Label>
			<Input type="number" id="executionDelay" bind:value={executionDelay} />
			<span class="text-xs">{dayjs(Date.now() + Number(executionDelay)).fromNow(true)}</span>
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
