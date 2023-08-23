<script lang="ts">
	import { ChainId, Token, TokenAmount } from '@dusalabs/sdk';
	import Button from '../../components/button.svelte';
	import { printAddress } from '../../utils/methods';
	import type { MyPageLoad } from './+page';
	import { clientStore } from '../../store/account';
	import { Args, type IClient } from '@massalabs/massa-web3';

	export let data: MyPageLoad;
	const { properties, balances } = data;

	let massaClient: IClient | null = null;
	clientStore.subscribe((client) => {
		massaClient = client;
	});

	let transferReceiver: string;
	let transferAmount: number;
	$: disabledTransfer = !transferReceiver || transferAmount == 0 || !massaClient;

	const token = new Token(ChainId.BUILDNET, properties.address, properties.decimals);

	const transfer = async () => {
		if (!massaClient) return;

		const amount = BigInt(transferAmount * 10 ** properties.decimals);
		console.log(amount);

		const txId = await massaClient
			.smartContracts()
			.callSmartContract({
				targetAddress: properties.address,
				functionName: 'transfer',
				parameter: new Args()
					.addString(transferReceiver)
					.addU256(BigInt(transferAmount * 10 ** properties.decimals)),
				coins: 0n,
				maxGas: 100_000_000n,
				fee: 0n
			})
			.catch((e) => {
				console.log(e);
			});
		console.log(txId);
	};
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-4xl">{properties.name} ({properties.symbol})</h1>
	<h2 class="text-2xl">Properties</h2>
	<div class="grid grid-cols-3 gap-4">
		<div>
			Total supply: {(properties.totalSupply / 10n ** BigInt(properties.decimals)).toLocaleString()}
			({properties.decimals}
			decimals)
		</div>
		<div>Owner: {printAddress(properties.owner)}</div>
		<div>Holders: {balances.length}</div>
	</div>
	{#if balances.length > 0}
		<h2 class="text-2xl">Balances</h2>
		{#each balances as { address, value }}
			{@const balance = new TokenAmount(token, value)}
			{@const share = balance.multiply(100n).divide(new TokenAmount(token, properties.totalSupply))}

			{#if balance.raw !== 0n}
				<p>
					{printAddress(address)}: {balance.toSignificant()} ({share.toSignificant(2)}%)
				</p>
			{/if}
		{/each}
	{/if}
	<h2 class="text-2xl">Actions</h2>
	{#if massaClient}
		<div class="flex flex-col gap-2">
			<div>
				<input type="text" bind:value={transferReceiver} placeholder="Receiver address" />
				<input type="number" bind:value={transferAmount} placeholder="Amount" />
				<Button onClick={transfer} disabled={disabledTransfer} text="Transfer" />
			</div>
		</div>
	{:else}
		<p>Connect wallet to perform actions</p>
	{/if}
</div>
