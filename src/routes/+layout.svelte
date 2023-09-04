<script lang="ts">
	import { onMount } from 'svelte';
	import {
		providers as getProviders,
		type IAccount,
		type IProvider
	} from '@massalabs/wallet-provider';
	import { ClientFactory } from '@massalabs/massa-web3';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { SvelteToastOptions } from '@zerodevx/svelte-toast/stores';
	import { printAddress } from '$lib/utils/methods';
	import Modal from '$lib/components/connect-modal.svelte';
	import { accountStore, clientStore } from '$lib/store/account';
	import Button from '$lib/components/button.svelte';
	import LightSwitch from '$lib/components/light-switch/light-switch.svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/stores';
	import '../app.css';
	import ChainSelect from '$lib/components/chain-select.svelte';

	const options: SvelteToastOptions = {};

	let showModal = false;
	let connectedAddress: string | undefined;
	let balance: string | undefined;
	accountStore.subscribe(async (account) => {
		connectedAddress = account?.address();
		balance = await account?.balance().then((res) => res.finalBalance);
	});
	let accounts: IAccount[];
	let selectedWallet: IProvider;
	let stationWallet: IProvider | undefined;
	let bearbyWallet: IProvider | undefined;

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
		closeModal();
	};

	const disconnect = () => {
		accountStore.set(null);
		accounts = [];
		localStorage.removeItem('wallet');
		localStorage.removeItem('accountIndex');
	};

	const closeModal = () => {
		document.body.style.overflow = 'auto';
		showModal = false;
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
	$: url = $page.url.pathname;
</script>

<main class="h-screen flex flex-col">
	<header class="flex justify-around items-center p-2">
		<nav class="flex items-center gap-4">
			<a class="font-medium" href="/">massa-tools</a>
			{#each ['explorer', 'create', 'multisig', 'staking'] as link}
				<a
					href="/{link.toLowerCase()}"
					class={cn(
						'text-sm font-medium hover:text-primary transition-colors capitalize',
						!url.includes(link) && ' text-muted-foreground'
					)}>{link}</a
				>
			{/each}
		</nav>
		<div class="flex items-center">
			<Button
				onClick={() => (showModal = true)}
				text={connectedAddress ? printAddress(connectedAddress) : 'Connect Wallet'}
			/>
			<ChainSelect />
			<LightSwitch />
		</div>
	</header>

	<section class="grow grid place-items-center">
		<slot />
	</section>

	<footer class="text-center p-2">
		<p>
			Made with ❤️ by
			<a
				class="hover:underline"
				target="_blank"
				href="https://github.com/JoeTheCookie217/massa-tools">JoeTheCookie217</a
			>
		</p>
	</footer>

	{#if showModal}
		<Modal
			{closeModal}
			{connect}
			{disconnect}
			{accounts}
			{select}
			{connectedAddress}
			{balance}
			{stationWallet}
			{bearbyWallet}
		/>
	{/if}
</main>
<SvelteToast {options} />
