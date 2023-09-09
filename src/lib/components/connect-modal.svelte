<script lang="ts">
	import { onMount } from 'svelte';
	import { printAddress, printMasBalance } from '$lib/utils/methods';
	import type { IAccount, IProvider } from '@massalabs/wallet-provider';
	import { providers as getProviders } from '@massalabs/wallet-provider';
	import * as Dialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from './ui/button';
	import { cn } from '$lib/utils';
	import { CrossIcon } from 'lucide-svelte';
	import accountStore from '$lib/store/account';
	import clientStore from '$lib/store/client';
	import { ClientFactory } from '@massalabs/massa-web3';

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

		const client = await ClientFactory.fromWalletProvider(selectedWallet, selectedAccount);
		clientStore.set(client);
		localStorage.setItem('wallet', selectedWallet.name());
		localStorage.setItem('accountIndex', index.toString());
		open = false;
	};

	const disconnect = () => {
		accountStore.set(null);
		accounts = [];
		localStorage.removeItem('wallet');
		localStorage.removeItem('accountIndex');
		open = false;
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

	let open = false;
	const onOpenChange = (e: boolean | undefined) => {
		if (e) open = e;
	};

	const emojis = ['🐼', '🦩', '🐸', '🐮', '🐇', '🐤'];
	const emoji = emojis[Math.floor(Math.random() * emojis.length)];
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Trigger>
		<Button variant="outline">
			{#if !connectedAddress}
				Connect Wallet
			{:else}
				{printAddress(connectedAddress)}
			{/if}
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{#if !connectedAddress}
					Connect Wallet
					<!-- {:else}
					{printAddress(connectedAddress)} -->
				{/if}
			</Dialog.Title>
			<!-- <Dialog.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</Dialog.Description> -->
		</Dialog.Header>
		<div>
			{#if connectedAddress}
				<div class="flex flex-col justify-center items-center">
					<span class="grid place-items-center h-16 w-16 text-4xl rounded-full bg-muted mb-4"
						>{emoji}</span
					>
					<span>{printAddress(connectedAddress)}</span>
					<span>{balance && printMasBalance(balance)}</span>
				</div>
			{:else if !accounts?.length}
				<div class="flex flex-col gap-4 grow py-6">
					<Button disabled={stationWallet === undefined} on:click={() => connect(stationWallet)}>
						Massa Station
					</Button>
					<Button disabled={bearbyWallet === undefined} on:click={() => connect(bearbyWallet)}>
						Bearby
					</Button>
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
						<Button on:click={() => select(account, index)}>Connect</Button>
					</div>
				{/each}
			{/if}
		</div>
		{#if connectedAddress}
			<Dialog.Footer class="flex justify-center">
				<Button on:click={copy}>
					{copied ? 'Copied!' : 'Copy'}
				</Button>
				<Button on:click={disconnect}>Disconnect</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
