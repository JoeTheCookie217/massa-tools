<script lang="ts">
	import type { Client } from '@massalabs/massa-web3';
	import { Button } from '$lib/components/ui/button';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildDeployToken } from '$lib/services/serialize';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import clientStore from '$lib/store/client';

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
	$: disabled = !name || !symbol || !decimals || !supply;

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

<div class="flex">
	<div class="grid grid-cols-2">
		<div>
			<Label for="name">Name</Label>
			<Input type="text" id="name" placeholder="My Token" bind:value={name} />
		</div>
		<div>
			<Label for="symbol">Symbol</Label>
			<Input type="text" id="symbol" placeholder="MYT" bind:value={symbol} />
		</div>
		<div>
			<Label for="decimals">Decimals</Label>
			<Input type="number" id="decimals" placeholder="18" bind:value={decimals} />
		</div>
		<div>
			<Label for="supply">Supply</Label>
			<Input type="number" id="supply" placeholder="1000000" bind:value={supply} />
		</div>
		<div>
			<input type="checkbox" name="mintable" bind:checked={mintable} />
			<label for="mintable">Mintable</label>
		</div>
		<div>
			<input type="checkbox" name="burnable" bind:checked={burnable} />
			<label for="burnable">Burnable</label>
		</div>
		<Button on:click={deploy} {disabled}>Deploy</Button>
	</div>
	<div>
		<h2>Deploy Data</h2>
		<pre>{JSON.stringify({ name, symbol, decimals, supply, mintable, burnable }, null, 2)}</pre>
	</div>
</div>
