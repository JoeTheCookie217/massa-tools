<script lang="ts">
	import type { Client } from '@massalabs/massa-web3';
	import Button from '$lib/components/button.svelte';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildDeployToken } from '$lib/services/serialize';
	import { clientStore } from '$lib/store/account';

	let client: Client | null;
	clientStore.subscribe(async (newClient) => {
		client = newClient;
	});

	let name: string;
	let symbol: string;
	let decimals: number;
	let supply: number;
	let mintable = false;
	let burnable = false;
	$: disabled = !name || !symbol || !decimals || !supply || !client;

	const { send, subscribe } = sendTx();
	subscribe((txState) => {
		console.log(txState);
	});

	async function deploy() {
		if (!client) return;

		const totalSupply = BigInt(supply) * BigInt(10 ** decimals);
		const deployData = buildDeployToken(name, symbol, decimals, totalSupply, mintable, burnable);
		send(deployData);
	}
</script>

<h1>Create ERC20</h1>
<div class="flex">
	<div class="grid grid-cols-2">
		<input type="text" bind:value={name} placeholder="Name" />
		<input type="text" bind:value={symbol} placeholder="Symbol" />
		<input type="number" bind:value={decimals} placeholder="Decimals" />
		<input type="number" bind:value={supply} placeholder="Supply" />
		<div>
			<input type="checkbox" name="mintable" bind:checked={mintable} />
			<label for="mintable">Mintable</label>
		</div>
		<div>
			<input type="checkbox" name="burnable" bind:checked={burnable} />
			<label for="burnable">Burnable</label>
		</div>
		<Button class="col-span-2" onClick={deploy} text="Deploy" {disabled} />
	</div>
	<div>
		<h2>Deploy Data</h2>
		<pre>{JSON.stringify({ name, symbol, decimals, supply, mintable, burnable }, null, 2)}</pre>
	</div>
</div>
