<script lang="ts">
	import { ChainId, Token, TokenAmount } from '@dusalabs/sdk';
	import { Button } from '$lib/components/ui/button';
	import { printAddress, printTokenAmount, providerToChainId } from '$lib/utils/methods';
	import clientStore from '$lib/store/client';
	import { fetchTokenAllowances, fetchTokenBalance } from '$lib/services/datastore';
	import type { Allowance } from '$lib/utils/types';
	import {
		buildBurn,
		buildDecreaseAllowance,
		buildMint,
		buildTransfer
	} from '$lib/services/serialize';
	import useSendTx from '$lib/hooks/useSendTx.js';
	import { onMount } from 'svelte';
	import { addRecentAddress } from '$lib/utils/localStorage';
	// import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Table from '$lib/components/ui/table';
	import ConnectModal from '$lib/components/connect-modal.svelte';
	import AddressCell from '$lib/components/address-cell.svelte';
	import AccountTypeCell from '$lib/components/account-type-cell.svelte';
	import CopyButton from '$lib/components/copy-button.svelte';

	export let data;
	const { properties, balances } = data;
	const tokenAddress = properties.address;

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();

	let allowances: Allowance[] = [];
	let userBalance: bigint;

	let transferReceiver: string;
	let transferAmount: number;
	$: disabledTransfer =
		!connectedAddress || !transferReceiver || !transferAmount || transferAmount > userBalance;

	let burnAmount: number;
	$: disabledBurn = !connectedAddress || !burnAmount || burnAmount > userBalance;

	let mintReceiver: string;
	let mintAmount: number;
	$: disabledMint = !connectedAddress || !mintReceiver || !mintAmount;

	$: {
		fetch(connectedAddress);
	}

	const fetch = (address: string | undefined) => {
		if (!address) return;

		fetchTokenAllowances(tokenAddress, address).then((res) => {
			allowances = res;
		});
		fetchTokenBalance(tokenAddress, address).then((balance) => {
			userBalance = balance;
		});
	};

	$: selectedNetwork = providerToChainId($clientStore.getPublicProviders()[0]);
	const token = new Token(selectedNetwork, tokenAddress, properties.decimals);

	const { send } = useSendTx();

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

	onMount(() => {
		addRecentAddress({
			address: tokenAddress,
			chainId: selectedNetwork,
			label: properties.name,
			type: 'token'
		});
	});
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-4xl">{properties.name} ({properties.symbol})</h1>
	<div class="flex">
		<h2 class="text-xl">
			{printAddress(properties.address)}
		</h2>
		<CopyButton copyText={properties.address} />
	</div>
	<h2 class="text-2xl">Properties</h2>
	<div class="grid grid-cols-3 gap-4">
		<div>
			Total supply: {printTokenAmount(new TokenAmount(token, properties.totalSupply))}
			({properties.decimals}
			decimals)
		</div>
		<div>
			<span>Owner:</span>
			<a href={`/explorer/${properties.owner}`}>
				{printAddress(properties.owner, 8)}
			</a>
		</div>
		<div>Holders: {properties.holders}</div>
		<div>Mintable: {properties.mintable}</div>
		<div>Burnable: {properties.burnable}</div>
		<div>Contract page: <a href={`/explorer/${properties.address}`} class="underline">View</a></div>
	</div>
	{#if balances.length > 0}
		<h2 class="text-2xl">Balances</h2>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[50px]">#</Table.Head>
					<Table.Head>Address</Table.Head>
					<Table.Head>Balance</Table.Head>
					<Table.Head>Share</Table.Head>
					<!-- <Table.Head>Value</Table.Head> -->
					<Table.Head class="w-[50px] text-right">Type</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each balances as { address, value }, i}
					{@const balance = new TokenAmount(token, value)}
					{@const share = Number(
						balance
							.multiply(100n)
							.divide(new TokenAmount(token, properties.totalSupply))
							.toSignificant(2)
					)}

					<Table.Row>
						<Table.Cell>{i + 1}</Table.Cell>
						<AddressCell {address} />
						<Table.Cell class="font-medium">{printTokenAmount(balance)}</Table.Cell>
						<Table.Cell>{share < 0.01 ? '<0.01' : share}%</Table.Cell>
						<!-- <Table.Cell class="font-medium">$???</Table.Cell> -->
						<Table.Cell class="text-right">
							<AccountTypeCell {address} />
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
	<h2 class="text-2xl">Actions</h2>
	{#if connectedAddress}
		<div class="flex flex-col gap-2">
			{#if userBalance > 0n}
				<div>
					<h3 class="text-lg">Transfer</h3>
					<div class="flex items-center gap-2">
						<div>
							<!-- <Label for="transferReceiver">Receiver address</Label> -->
							<Input
								type="text"
								placeholder="Receiver address"
								id="transferReceiver"
								bind:value={transferReceiver}
							/>
						</div>
						<div>
							<!-- <Label for="transferAmount">Amount</Label> -->
							<Input
								type="number"
								placeholder="Amount"
								id="transferAmount"
								bind:value={transferAmount}
							/>
						</div>
						<Button on:click={transfer} disabled={disabledTransfer}>Transfer</Button>
					</div>
				</div>
				{#if properties.burnable}
					<div>
						<h3 class="text-lg">Burn</h3>
						<div class="flex items-center gap-2">
							<div>
								<!-- <Label for="burnAmount">Amount</Label> -->
								<Input type="number" placeholder="Amount" id="burnAmount" bind:value={burnAmount} />
							</div>
							<Button on:click={burn} disabled={disabledBurn}>Burn</Button>
						</div>
					</div>
				{/if}
			{/if}
			{#if connectedAddress === properties.owner && properties.mintable}
				<div>
					<h3 class="text-lg">Mint</h3>
					<div class="flex items-center gap-2">
						<div>
							<!-- <Label for="mintReceiver">Receiver address</Label> -->
							<Input
								type="text"
								placeholder="Receiver address"
								id="mintReceiver"
								bind:value={mintReceiver}
							/>
						</div>
						<div>
							<!-- <Label for="mintAmount">Amount</Label> -->
							<Input type="number" placeholder="Amount" id="mintAmount" bind:value={mintAmount} />
						</div>
						<Button on:click={mint} disabled={disabledMint}>Mint</Button>
					</div>
				</div>
			{/if}
			{#if allowances.length > 0}
				<h3 class="text-lg">Allowances</h3>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>#</Table.Head>
							<Table.Head>Address</Table.Head>
							<Table.Head>Allowance</Table.Head>
							<Table.Head class="w-[50px]">Type</Table.Head>
							<Table.Head class="text-center">Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each allowances as { spender, amount }, i}
							{@const allowance = new TokenAmount(token, amount)}
							{#if allowance.raw !== 0n && spender && spender !== connectedAddress}
								<Table.Row>
									<Table.Cell>{i + 1}</Table.Cell>
									<AddressCell address={spender} />
									<Table.Cell class="font-medium"
										>{Number(allowance.toSignificant()).toLocaleString()}</Table.Cell
									>
									<Table.Cell>
										<AccountTypeCell address={spender} />
									</Table.Cell>
									<Table.Cell class="text-center">
										<Button variant="ghost" on:click={() => revokeAllowance(spender, amount)}
											>Revoke</Button
										>
									</Table.Cell>
								</Table.Row>
							{/if}
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</div>
	{:else}
		<ConnectModal />
	{/if}
</div>
