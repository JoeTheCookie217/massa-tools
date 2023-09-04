<script lang="ts">
	import { onMount } from 'svelte';
	import { printAddress, printMasBalance } from '$lib/utils/methods';
	import type { IAccount, IProvider } from '@massalabs/wallet-provider';
	import { providers as getProviders } from '@massalabs/wallet-provider';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from './ui/button';
	import { cn } from '$lib/utils';
	import { CrossIcon } from 'lucide-svelte';
	import { accountStore, clientStore } from '$lib/store/account';

	let accounts: IAccount[];
	let selectedWallet: IProvider;
	let stationWallet: IProvider | undefined;
	let bearbyWallet: IProvider | undefined;

	let connectedAddress: string | undefined;
	let balance: string | undefined;
	accountStore.subscribe(async (account) => {
		connectedAddress = account?.address();
		balance = await account?.balance().then((res) => res.finalBalance);
	});

	let copied = false;
	const copy = () => {
		copied = true;
		connectedAddress && navigator.clipboard.writeText(connectedAddress);
		setTimeout(() => {
			copied = false;
		}, 1000);
	};

	const connect = async (wallet: IProvider | undefined) => {
		if (!wallet) return;

		localStorage.setItem('wallet', wallet.name());
		const _accounts = await wallet.accounts();
		if (!_accounts?.length) return;

		selectedWallet = wallet;
		accounts = _accounts;
		return accounts;
	};

	const select = async (selectedAccount: IAccount, index: number) => {
		accountStore.set(selectedAccount);

		selectedWallet.getNodesUrls().then((res) => {
			console.log(res);
		});

		// @ts-ignore
		const client = await ClientFactory.fromWalletProvider(selectedWallet, selectedAccount);
		clientStore.set(client);
		localStorage.setItem('accountIndex', index.toString());
	};

	const disconnect = () => {
		accountStore.set(null);
		accounts = [];
		localStorage.removeItem('wallet');
		localStorage.removeItem('accountIndex');
	};

	onMount(async () => {
		const providers = await getProviders();
		const _stationWallet = providers.find((provider) => provider.name() === 'MASSASTATION');
		stationWallet = _stationWallet;
		const _bearbyWallet = providers.find((provider) => provider.name() === 'BEARBY');
		bearbyWallet = _bearbyWallet;
		const walletKey = localStorage.getItem('wallet');
		const wallet = providers.find((provider) => provider.name() === walletKey);
		if (!walletKey || !wallet) return;

		const acc = await connect(wallet);
		const accountIndex = Number(localStorage.getItem('accountIndex')) ?? '0';
		acc?.length && select(acc[accountIndex], accountIndex);
	});
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		<Button variant="outline">
			{#if !connectedAddress}
				Connect Wallet
			{:else}
				{printAddress(connectedAddress)}
			{/if}
		</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>
				{#if !connectedAddress}
					Connect Wallet
				{:else}
					{printAddress(connectedAddress)}
				{/if}
			</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<Button variant="outline">Click</Button>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={() => console.log('action')}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- {#if connectedAddress}
			<div class="">
				<div>
					<span>{printAddress(connectedAddress)}</span>
					{#if balance}
						<span>{printMasBalance(balance)}</span>
					{/if}
				</div>
				<div>
					<Button text={copied ? 'Copied' : 'Copy'} onClick={copy} />
					<Button text="Disconnect" onClick={disconnect} />
				</div>
			</div>
		{:else if !accounts || accounts.length === 0}
			<div class="flex flex-col gap-4 grow py-6">
				<Button
					disabled={stationWallet === undefined}
					text="Massa Station"
					onClick={() => connect(stationWallet)}
				/>
				<Button
					disabled={bearbyWallet === undefined}
					text="Bearby"
					onClick={() => connect(bearbyWallet)}
				/>
			</div>
		{:else}
			{#each accounts as account, index}
				<div class="flex justify-between items-center p-2">
					<span>{printAddress(account.address())}</span>
					{#await account.balance() then balance}
						<span>{printMasBalance(balance.finalBalance)}</span>
					{:catch error}
						<span>{error.message}</span>
					{/await}
					<Button text="Connect" onClick={() => select(account, index)} />
				</div>
			{/each}
		{/if} -->
