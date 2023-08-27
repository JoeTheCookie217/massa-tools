<script lang="ts">
	import { ChainId, Token, TokenAmount } from '@dusalabs/sdk';
	import Button from '../../components/button.svelte';
	import { printAddress } from '../../utils/methods';
	import type { MyPageLoad } from './+page';
	import { clientStore } from '../../store/account';
	import type { Client } from '@massalabs/massa-web3';
	import { fetchTokenAllowances, fetchTokenBalance } from '../../services/datastore';
	import type { Allowance } from '../../utils/types';
	import {
		buildBurn,
		buildDecreaseAllowance,
		buildMint,
		buildTransfer
	} from '../../services/serialize';
	import { sendTx } from '../../hooks/sendTx';

	const MAX_ALLOWANCE = 2n ** 64n - 1n;

	export let data: MyPageLoad;
	const { properties, balances } = data;
	const tokenAddress = properties.address;

	let massaClient: Client | null = null;
	clientStore.subscribe((client) => {
		massaClient = client;
	});
	$: connectedAddress = massaClient?.wallet().getBaseAccount()?.address() || undefined;

	let userBalance: bigint;

	let transferReceiver: string;
	let transferAmount: number;
	$: disabledTransfer =
		!massaClient || !transferReceiver || !transferAmount || transferAmount > userBalance;

	let burnAmount: number;
	$: disabledBurn = !massaClient || !burnAmount || burnAmount > userBalance;

	let mintReceiver: string;
	let mintAmount: number;
	$: disabledMint = !massaClient || !mintReceiver || !mintAmount;

	let allowances: Allowance[] = [];
	$: {
		console.log(connectedAddress);
		fetch();
	}

	const fetch = () => {
		if (!connectedAddress) return;

		fetchTokenAllowances(tokenAddress, connectedAddress).then((res) => {
			allowances = res;
		});
		fetchTokenBalance(tokenAddress, connectedAddress).then((balance) => {
			userBalance = balance;
		});
	};

	const token = new Token(ChainId.BUILDNET, tokenAddress, properties.decimals);

	const { send, subscribe } = sendTx();
	subscribe((state) => {
		console.log(state);
	});

	const transfer = async () => {
		const amount = BigInt(transferAmount * 10 ** properties.decimals);
		const transferData = buildTransfer(amount, tokenAddress, transferReceiver);
		send(transferData);
	};
	const revokeAllowance = async (spender: string, amount: bigint) => {
		const revokeData = buildDecreaseAllowance(amount, tokenAddress, spender);
		send(revokeData);
	};
	const mint = async () => {
		const amount = BigInt(mintAmount * 10 ** properties.decimals);
		const mintData = buildMint(amount, tokenAddress, mintReceiver);
		send(mintData);
	};
	const burn = async () => {
		const amount = BigInt(burnAmount * 10 ** properties.decimals);
		const burnData = buildBurn(amount, tokenAddress);
		send(burnData);
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
		<div>Mintable: {properties.mintable}</div>
		<div>Burnable: {properties.burnable}</div>
	</div>
	{#if balances.length > 0}
		<h2 class="text-2xl">Balances</h2>
		{#each balances as { address, value }}
			{@const balance = new TokenAmount(token, value)}
			{@const share = balance.multiply(100n).divide(new TokenAmount(token, properties.totalSupply))}

			<p>
				{printAddress(address)}: {balance.toSignificant()} ({share.toSignificant(3)}%)
			</p>
		{/each}
	{/if}
	<h2 class="text-2xl">Actions</h2>
	{#if massaClient}
		<div class="flex flex-col gap-2">
			{#if userBalance > 0n}
				<div>
					<h3 class="text-lg">Transfer</h3>
					<input type="text" bind:value={transferReceiver} placeholder="Receiver address" />
					<input type="number" bind:value={transferAmount} placeholder="Amount" />
					<Button onClick={transfer} disabled={disabledTransfer} text="Transfer" />
				</div>
				{#if properties.burnable}
					<div>
						<h3 class="text-lg">Burn</h3>
						<input type="number" bind:value={burnAmount} placeholder="Amount" />
						<Button onClick={burn} disabled={disabledBurn} text="Burn" />
					</div>
				{/if}
			{/if}
			{#if connectedAddress === properties.owner && properties.mintable}
				<div>
					<h3 class="text-lg">Mint</h3>
					<input type="text" bind:value={mintReceiver} placeholder="Receiver address" />
					<input type="number" bind:value={mintAmount} placeholder="Amount" />
					<Button onClick={mint} disabled={disabledMint} text="Mint" />
				</div>
			{/if}
			{#if allowances.length > 0}
				<h3 class="text-lg">Allowances</h3>
				{#each allowances as { spender, amount }}
					{@const allowance = new TokenAmount(token, amount)}
					{#if allowance.raw !== 0n && spender && spender !== connectedAddress}
						<p>
							{printAddress(spender)}: {allowance.toSignificant()}
							<Button onClick={() => revokeAllowance(spender, amount)} text="Revoke" />
						</p>
					{/if}
				{/each}
			{/if}
		</div>
	{:else}
		<p>Connect wallet to perform actions</p>
	{/if}
</div>
