<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import AddressCell from '$lib/components/address-cell.svelte';
	import AccountTypeCell from '$lib/components/account-type-cell.svelte';
	import type { FullTransaction } from './+page';
	import clientStore from '$lib/store/client';
	import { printAddress, printMasBalance, printUint8Array } from '$lib/utils/methods';
	import { Args, toMAS } from '@massalabs/massa-web3';
	import { Button } from '$lib/components/ui/button';
	import { buildApprove, buildExecute, buildReceive, buildRevoke, buildSubmit } from './methods';
	import useSendTx from '$lib/hooks/useSendTx';
	import CopyButton from '$lib/components/copy-button.svelte';
	import dayjs from 'dayjs';

	export let multisigAddress: string;
	export let transactions: FullTransaction[];
	export let required: number;

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();

	const { send } = useSendTx();

	const approve = (index: number) => {
		const approveData = buildApprove(multisigAddress, index);
		send(approveData);
	};

	const revoke = (index: number) => {
		const revokeData = buildRevoke(multisigAddress, index);
		send(revokeData);
	};

	const execute = (index: number) => {
		const executeData = buildExecute(multisigAddress, index);
		send(executeData);
	};
</script>

<div>
	<h3 class="text-2xl">Transactions</h3>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>#</Table.Head>
				<Table.Head>Recipient</Table.Head>
				<Table.Head>Method</Table.Head>
				<Table.Head>Arguments</Table.Head>
				<Table.Head>Value</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>Approvals</Table.Head>
				<Table.Head class="w-[50px]">Type</Table.Head>
				<Table.Head class="text-center">Action</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each transactions as transaction, i}
				{@const { to, method, executed, value, data } = transaction.tx}
				{@const hasVotedFor = transaction.approvals.some(
					(a) => a.address === connectedAddress && a.support
				)}
				{@const hasVotedAgainst = transaction.approvals.some(
					(a) => a.address === connectedAddress && !a.support
				)}
				{@const isReady = transaction.approvals.filter((a) => a.support).length >= required}
				{@const forVotes = transaction.approvals.filter((a) => a.support)}
				{@const delay = Number(transaction.tx.timestamp)}

				<Table.Row>
					<Table.Cell>{i}</Table.Cell>
					<AddressCell address={to} />
					<Table.Cell>{method}</Table.Cell>
					<Table.Cell>
						{#if method === 'addOwner' && to == multisigAddress}
							{new Args(data).nextString()}
						{:else if method === 'removeOwner' && to == multisigAddress}
							{new Args(data).nextString()}
						{:else if method === 'replaceOwner' && to == multisigAddress}
							{@const args = new Args(data)}
							<div class="flex flex-col">
								<span>
									{args.nextString()}
								</span>
								<span>
									{args.nextString()}
								</span>
							</div>
						{:else if data.length}
							<div>
								{printUint8Array(data)}
								<CopyButton copyText={value.toString()} />
							</div>
						{:else}
							<span>-</span>
						{/if}
					</Table.Cell>
					<Table.Cell class="font-medium">{printMasBalance(toMAS(value).toFixed(2))}</Table.Cell>
					<Table.Cell>
						{#if executed}
							Executed
						{:else if forVotes.length >= required}
							Ready {delay > Date.now() ? dayjs(delay).fromNow() : ''}
						{:else}
							Pending
						{/if}
					</Table.Cell>

					<Table.Cell>
						<Tooltip.Root openDelay={50}>
							<Tooltip.Trigger>
								<span>
									{forVotes.length} / {required}
								</span>
							</Tooltip.Trigger>
							<Tooltip.Content>
								{#each transaction.approvals as approval}
									<div class="text-xs">
										{printAddress(approval.address)} - {approval.support ? 'For' : 'Against'}
									</div>
								{/each}
							</Tooltip.Content>
						</Tooltip.Root>
					</Table.Cell>

					<Table.Cell class="text-right">
						<AccountTypeCell address={to} />
					</Table.Cell>

					<Table.Cell>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button
									variant="ghost"
									builders={[builder]}
									class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
								>
									<DotsHorizontal class="w-4 h-4" />
									<span class="sr-only">Open menu</span>
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-[160px]">
								<DropdownMenu.Item disabled={hasVotedFor || executed} on:click={() => approve(i)}
									>Approve</DropdownMenu.Item
								>
								<DropdownMenu.Item disabled={hasVotedAgainst || executed} on:click={() => revoke(i)}
									>Revoke</DropdownMenu.Item
								>
								<DropdownMenu.Item disabled={!isReady || executed} on:click={() => execute(i)}
									>Execute</DropdownMenu.Item
								>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
