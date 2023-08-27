<script lang="ts">
	import type { Client } from '@massalabs/massa-web3';
	import Button from '../../components/button.svelte';
	import { sendTx } from '../../hooks/sendTx';
	import { buildDeployToken } from '../../services/serialize';
	import { clientStore } from '../../store/account';

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

	const { send } = sendTx();

	async function deploy() {
		if (!client) return;

		const totalSupply = BigInt(supply) * BigInt(10 ** decimals);
		const deployData = buildDeployToken(name, symbol, decimals, totalSupply, mintable, burnable);
		send(deployData);
	}
</script>

<h1>Create ERC20</h1>
<input type="text" bind:value={name} placeholder="Name" />
<input type="text" bind:value={symbol} placeholder="Symbol" />
<input type="number" bind:value={decimals} placeholder="Decimals" />
<input type="number" bind:value={supply} placeholder="Supply" />
<input type="checkbox" bind:checked={mintable} /> Mintable
<input type="checkbox" bind:checked={burnable} /> Burnable
<Button onClick={deploy} text="Deploy" />
