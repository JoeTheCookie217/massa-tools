<script lang="ts">
	import { parseEther } from '@dusalabs/sdk';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { sendTx } from '$lib/hooks/sendTx';
	import { buildApprove, buildReceive, buildSubmit } from './methods';
	import clientStore from '$lib/store/client';
	import { printMasBalance } from '$lib/utils/methods';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { addRecentMultisig } from '$lib/utils/localStorage';
	import { toMAS } from '@massalabs/massa-web3';
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
		const value = parseEther(submitValue.toString());
		const submitData = buildSubmit(multisigAddress, submitTo, value, new Uint8Array());
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
		const value = parseEther(receiveValue.toString());
		const receiveData = buildReceive(multisigAddress, value);
		send(receiveData);
	};

	onMount(() => {
		addRecentMultisig(multisigAddress);
	});
</script>

{#if connectedAddress}
	{#if owners.includes(connectedAddress)}
		<div>
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
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Index</Table.Head>
						<Table.Head>Address</Table.Head>
						<Table.Head>Value</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="w-[50px]">Type</Table.Head>
						<Table.Head class="text-center">Action</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each transactions as transaction, i}
						<Table.Row>
							<Table.Cell>{i}</Table.Cell>
							<AddressCell address={transaction.to} />
							<Table.Cell class="font-medium">{transaction.value.toLocaleString()}</Table.Cell>
							<Table.Cell>{transaction.executed ? 'Executed' : 'Pending'}</Table.Cell>
							<AccountTypeCell address={transaction.to} />
							<Table.Cell class="text-center">
								<Button variant="ghost" on:click={() => revoke(i)}>Revoke</Button>
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
				<span>{owners.join()}</span>
			</div>
		</div>
	{:else}
		<p>You are not an owner</p>
	{/if}
{:else}
	<p>Connect your wallet</p>
{/if}
