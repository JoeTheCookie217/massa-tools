<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import AddressCell from '$lib/components/address-cell.svelte';
	import AccountTypeCell from '$lib/components/account-type-cell.svelte';
	import type { FullTransaction } from './+page';
	import clientStore from '$lib/store/client';
	import { printAddress, printMasBalance } from '$lib/utils/methods';
	import { toMAS } from '@massalabs/massa-web3';
	import { Button } from '$lib/components/ui/button';
	import { buildApprove, buildExecute, buildReceive, buildRevoke, buildSubmit } from './methods';
	import useSendTx from '$lib/hooks/useSendTx';

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
	<h3 class="text-lg">Transactions</h3>
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
				{@const hasVoted = transaction.approvals.some((a) => a.address === connectedAddress)}
				{@const isReady = transaction.approvals.length >= required}
				{@const forVotes = transaction.approvals.filter((a) => a.support)}
				{@const againstVotes = transaction.approvals.filter((a) => !a.support)}

				<Table.Row>
					<Table.Cell>{i}</Table.Cell>
					<AddressCell address={to} />
					<Table.Cell>{method}</Table.Cell>
					<Table.Cell>{data}</Table.Cell>
					<Table.Cell class="font-medium">{printMasBalance(toMAS(value).toFixed(2))}</Table.Cell>
					<Table.Cell>{executed ? 'Executed' : 'Pending'}</Table.Cell>

					<Table.Cell>
						<Tooltip.Root openDelay={50}>
							<Tooltip.Trigger>
								<span>
									{forVotes.length} / {againstVotes.length}
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
								<DropdownMenu.Item disabled={hasVoted || executed} on:click={() => approve(i)}
									>Approve</DropdownMenu.Item
								>
								<DropdownMenu.Item disabled={!hasVoted || executed} on:click={() => revoke(i)}
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
