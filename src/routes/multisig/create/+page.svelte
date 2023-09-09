<script lang="ts">
	import type { Client } from '@massalabs/massa-web3';
	import { Button } from '$lib/components/ui/button';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildDeployMultisig } from '$lib/services/serialize';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import clientStore from '$lib/store/client';

	let client: Client | null;
	clientStore.subscribe(async (newClient) => {
		client = newClient;
	});

	let owners: string[];
	let ownersLength: number = 0;
	let required: number;
	$: disabled = !owners || !required;

	const { send, subscribe } = sendTx();
	subscribe((txState) => {
		console.log(txState);
	});

	async function deploy() {
		if (!client) return;

		const deployData = buildDeployMultisig(owners, required);
		send(deployData);
	}
</script>

<div class="flex">
	<div class="grid grid-cols-2">
		<div>
			<Label for="required">Required</Label>
			<Input type="number" id="required" placeholder="2" bind:value={required} />
		</div>
		<Button bind:value={ownersLength}>+</Button>
		{#each Array(ownersLength) as _, i}
			<div>
				<Label for="owner">Owner {i + 1}</Label>
				<Input type="text" id="owner" placeholder="0x..." bind:value={owners[i]} />
			</div>
		{/each}
		<Button on:click={deploy} {disabled}>Deploy</Button>
	</div>
	<div>
		<h2>Deploy Data</h2>
		<pre>{JSON.stringify({ owners, required }, null, 2)}</pre>
	</div>
</div>
