<script lang="ts">
	import { parseEther, parseUnits } from '@dusalabs/sdk';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildApprove, buildExecute, buildReceive, buildSubmit } from './methods';
	import clientStore from '$lib/store/client';
	import { printMasBalance } from '$lib/utils/methods';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { addRecentMultisig } from '$lib/utils/localStorage';
	import { fromMAS, toMAS } from '@massalabs/massa-web3';
	import * as Table from '$lib/components/ui/table';
	import AddressCell from '$lib/components/address-cell.svelte';
	import AccountTypeCell from '$lib/components/account-type-cell.svelte';

	export let data;

	const { address: multisigAddress, balance, owners, required, transactions } = data;

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();

	let submitTo: string;
	let submitValue: number;
	let receiveValue: number;

	const { send } = sendTx();

	const submit = () => {
		const value = fromMAS(submitValue.toString());
		const submitData = buildSubmit(multisigAddress, '', submitTo, value, new Uint8Array());
		send(submitData);
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
		<div>
			<div>
				<h3 class="text-lg">Submit</h3>

				<div class="flex items-center gap-2">
					<div class="">
						<Label for="recipient">Recipient</Label>
						<Input type="text" id="recipient" placeholder="0x..." bind:value={submitTo} />
					</div>
					<div class="">
						<Label for="submitValue">Value (MAS)</Label>
						<Input type="number" id="submitValue" placeholder="1.234" bind:value={submitValue} />
					</div>
					<Button on:click={submit}>Submit</Button>
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
				<h2 class="text-lg">Transactions</h2>
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

			<div class="flex flex-col">
				<div>
					<span>Balance:</span>
					<span>{printMasBalance(toMAS(balance).toFixed())}</span>
				</div>
				<div>
					<span>Required:</span>
					<span>{required}</span>
				</div>
				<div>
					<span>Owners:</span>
					<span>{JSON.stringify(owners, undefined, 4)}</span>
				</div>
			</div>
		</div>
	{:else}
		<p>You are not an owner</p>
	{/if}
{:else}
	<p>Connect your wallet</p>
{/if}
