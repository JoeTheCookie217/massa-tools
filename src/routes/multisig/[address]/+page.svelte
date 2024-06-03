<script lang="ts">
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import useSendTx from '$lib/hooks/useSendTx';
	import { buildApprove, buildExecute, buildReceive, buildRevoke, buildSubmit } from './methods';
	import clientStore from '$lib/store/client';
	import { printAddress, printMasBalance, tokenAddresses } from '$lib/utils/methods';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { addRecentAddress } from '$lib/utils/localStorage';
	import { fromMAS, toMAS } from '@massalabs/massa-web3';
	import CopyButton from '$lib/components/copy-button.svelte';
	import { TokenAmount } from '@dusalabs/sdk';
	import { CHAIN_ID } from '$lib/utils/config';
	import Transactions from './transactions.svelte';
	import AddressBuble from '$lib/components/address-bubble.svelte';
	import AddOwnerModal from './add-owner-modal.svelte';
	import RemoveOwnerModal from './remove-owner-modal.svelte';
	import ReplaceOwnerModal from './replace-owner-modal.svelte';

	export let data;

	// prettier-ignore
	const { address: multisigAddress, balance, owners, required, transactions, erc20Balances, executionDelay, upgradeDelay } = data;
	const argsPlaceholder = '{"0": 45, "1": 19, "2": 0, "3": 21}';

	$: connectedAddress = $clientStore.wallet().getBaseAccount()?.address();

	let submitTo: string;
	let submitMethod: string = '';
	let submitArgs: string = '';
	let submitValue: number;
	$: disabledSubmit = !submitTo;
	let receiveValue: number;
	$: disabledDeposit = !receiveValue;

	const { send } = useSendTx();

	const submit = () => {
		try {
			const value = fromMAS((submitValue || 0).toString());
			const params = new Uint8Array(Object.values(JSON.parse(submitArgs || '{}')));
			const submitData = buildSubmit(multisigAddress, submitTo, submitMethod, value, params);
			send(submitData);
		} catch (e) {
			console.log(e);
		}
	};

	const receive = () => {
		const value = fromMAS(receiveValue.toString());
		console.log(value);
		const receiveData = buildReceive(multisigAddress, value);
		send(receiveData);
	};

	onMount(() => {
		addRecentAddress({ address: multisigAddress, type: 'multisig' });
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
					<div class="flex gap-2 mx-6">
						{#each erc20Balances as b, i}
							{@const token = tokenAddresses[i][CHAIN_ID]}
							{#if b > 0 && b < 2n ** 256n - 1n}
								<span>{new TokenAmount(token, b).toSignificant()} {token.symbol}</span>
							{/if}
						{/each}
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div>
						<span>Required:</span>
						<span>{required}</span>
					</div>
					<div>
						<span>Upgrade delay:</span>
						<span>{dayjs(Date.now() + upgradeDelay).fromNow(true)}</span>
					</div>
					<div>
						<span>Execution delay:</span>
						<span>{dayjs(Date.now() + executionDelay).fromNow(true)}</span>
					</div>
				</div>
			</div>

			<div>
				<h3 class="text-lg">Owners {owners.length}</h3>
				<AddOwnerModal {multisigAddress} />
				<RemoveOwnerModal {multisigAddress} {owners} />
				<ReplaceOwnerModal {multisigAddress} {owners} />
				<div class="flex gap-2">
					{#each owners as owner}
						<div class="">
							<a
								href={`/explorer/${owner}`}
								class="flex items-center gap-4 p-4 rounded-md border-input border"
							>
								<AddressBuble address={owner} />
								<span>{printAddress(owner)}</span>
							</a>
						</div>
					{/each}
				</div>
			</div>

			<Transactions {multisigAddress} {transactions} {required} />

			<div>
				<h3 class="text-lg">Deposit</h3>
				<div class="flex items-center gap-2">
					<div>
						<Input type="number" id="receiveValue" placeholder="Amount" bind:value={receiveValue} />
					</div>
					<Button on:click={receive} disabled={disabledDeposit}>Deposit</Button>
				</div>
			</div>

			<div>
				<h3 class="text-lg">Submit</h3>

				<div class="flex items-end gap-2">
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
					<Button on:click={submit} disabled={disabledSubmit}>Submit</Button>
				</div>
				<div class="flex flex-col gap-1 mt-1 text-sm">
					<i
						>Leave <strong>method</strong> and <strong>arguments</strong> fields empty for MAS transfer</i
					>
					<i
						>Use this <a
							href="https://massexplo.io/readcontract"
							target="_blank"
							rel="noreferrer"
							class="text-blue-500 underline">massexplo tool</a
						> to build arguments</i
					>
				</div>
			</div>
		</div>
	{:else}
		<p>You are not an owner</p>
	{/if}
{:else}
	<p>Connect your wallet</p>
{/if}
