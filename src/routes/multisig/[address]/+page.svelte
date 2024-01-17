<script lang="ts">
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildApprove, buildExecute, buildReceive, buildSubmit } from './methods';
	import clientStore from '$lib/store/client';
	import {
		printAddress,
		printMasBalance,
		providerToChainId,
		tokenAddresses
	} from '$lib/utils/methods';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { addRecentMultisig } from '$lib/utils/localStorage';
	import { fromMAS, toMAS } from '@massalabs/massa-web3';
	import * as Table from '$lib/components/ui/table';
	import AddressCell from '$lib/components/address-cell.svelte';
	import AccountTypeCell from '$lib/components/account-type-cell.svelte';
	import CopyButton from '$lib/components/copy-button.svelte';
	import { TokenAmount } from '@dusalabs/sdk';

	export let data;

	const { address: multisigAddress, balance, owners, required, transactions, erc20Balances } = data;
	const argsPlaceholder = '{"0": 45, "1": 19, "2": 0, "3": 21}';

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();
	$: selectedNetwork = providerToChainId($clientStore.getPublicProviders()[0]);

	let submitTo: string;
	let submitMethod: string = '';
	let submitArgs: string = '';
	let submitValue: number;
	let receiveValue: number;

	const { send } = sendTx();

	const submit = () => {
		try {
			const value = fromMAS(submitValue.toString());
			const params = new Uint8Array(Object.values(JSON.parse(submitArgs)));
			console.log(params);
			const submitData = buildSubmit(multisigAddress, submitMethod, submitTo, value, params);
			send(submitData);
		} catch (e) {
			console.log(e);
		}
	};

	const approve = (index: number) => {
		const approveData = buildApprove(multisigAddress, index);
		send(approveData);
	};

	const revoke = (index: number) => {
		const revokeData = buildApprove(multisigAddress, index);
		send(revokeData);
	};

	const receive = () => {
		const value = fromMAS(receiveValue.toString());
		console.log(value);
		const receiveData = buildReceive(multisigAddress, value);
		send(receiveData);
	};

	const execute = (index: number) => {
		const executeData = buildExecute(multisigAddress, index);
		send(executeData);
	};

	onMount(() => {
		addRecentMultisig(multisigAddress);
	});
</script>

{#if connectedAddress}
	{#if owners.includes(connectedAddress)}
		<div class="flex flex-col gap-10">
			<div class="flex flex-col">
				<h3 class="text-lg">Information</h3>
				<div class="flex items-center">
					<div>
						<span>Address:</span>
						<span>{printAddress(multisigAddress)}</span>
						<CopyButton copyText={multisigAddress} />
					</div>
					<span>Balance: {printMasBalance(toMAS(balance).toFixed())}</span>
					<div class="flex flex-col gap-1">
						{#each erc20Balances as b, i}
							{@const token = tokenAddresses[i][selectedNetwork]}
							{#if b > 0 && b < 2n ** 256n - 1n}
								<span>{new TokenAmount(token, b).toSignificant()} {token.symbol}</span>
							{/if}
						{/each}
					</div>
				</div>
				<div class="flex items-center">
					<div>
						<span>Owners:</span>
						<span>{owners.length}</span>
						<div class="flex flex-col gap-1">
							{#each owners as owner}
								<a href={`/explorer/${owner}`}>
									{printAddress(owner)}
								</a>
							{/each}
						</div>
					</div>
					<div>
						<span>Required:</span>
						<span>{required}</span>
					</div>
				</div>
			</div>
			<div>
				<h3 class="text-lg">Submit</h3>

				<div class="flex items-center gap-2">
					<div class="">
						<Label for="recipient">Recipient</Label>
						<Input type="text" id="recipient" placeholder="0x..." bind:value={submitTo} />
					</div>
					<div class="">
						<Label for="method">Method</Label>
						<Input type="text" id="method" placeholder="swap" bind:value={submitMethod} />
					</div>
					<div class="">
						<Label for="args">Arguments</Label>
						<Input type="text" id="args" placeholder={argsPlaceholder} bind:value={submitArgs} />
					</div>
					<div class="">
						<Label for="submitValue">Value (MAS)</Label>
						<Input type="number" id="submitValue" placeholder="1.234" bind:value={submitValue} />
					</div>
					<Button on:click={submit}>Submit</Button>
				</div>
				<div class="flex flex-col gap-1 text-sm">
					<i
						>Leave <strong>method</strong> and <strong>arguments</strong> fields empty for MAS transfer</i
					>
					<i
						>Use this <a href="https://massexplo.io/readcontract" target="_blank" rel="noreferrer"
							>massexplo tool</a
						> to build arguments</i
					>
				</div>
			</div>
			<div>
				<h3 class="text-lg">Deposit</h3>
				<div class="flex items-center gap-2">
					<div>
						<Input type="number" id="receiveValue" placeholder="Amount" bind:value={receiveValue} />
					</div>
					<Button on:click={receive}>Deposit</Button>
				</div>
			</div>
			<div>
				<h3 class="text-lg">Transactions</h3>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>#</Table.Head>
							<Table.Head>Address</Table.Head>
							<Table.Head>Value</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Approvals</Table.Head>
							<Table.Head class="w-[50px]">Type</Table.Head>
							<Table.Head class="text-center">Action</Table.Head>
							<Table.Head class="text-center">Action</Table.Head>
							<Table.Head class="text-center">Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each transactions as transaction, i}
							{@const { to, executed, value } = transaction.tx}
							<Table.Row>
								{transaction.approvals}
								<Table.Cell>{i}</Table.Cell>
								<AddressCell address={to} />
								<Table.Cell class="font-medium"
									>{printMasBalance(toMAS(value).toFixed(2))}</Table.Cell
								>
								<Table.Cell>{executed ? 'Executed' : 'Pending'}</Table.Cell>
								<Table.Cell>{transaction.approvals.length}</Table.Cell>
								<Table.Cell class="text-right">
									<AccountTypeCell address={to} />
								</Table.Cell>

								<!-- TODO: use one dropdown menu with the different actions instead -->
								<Table.Cell class="text-center">
									<Button variant="ghost" on:click={() => approve(i)}>Approve</Button>
								</Table.Cell>
								<Table.Cell class="text-center">
									<Button variant="ghost" on:click={() => revoke(i)}>Revoke</Button>
								</Table.Cell>
								<Table.Cell class="text-center">
									<Button variant="ghost" on:click={() => execute(i)}>Execute</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	{:else}
		<p>You are not an owner</p>
	{/if}
{:else}
	<p>Connect your wallet</p>
{/if}
