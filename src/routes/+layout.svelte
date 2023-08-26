<script lang="ts">
	import '../app.css';
	import { printAddress } from '../utils/methods';
	import { onMount } from 'svelte';
	import Modal from '../components/modal.svelte';
	import { accountStore, clientStore } from '../store/account';
	import Button from '../components/button.svelte';
	import {
		providers as getProviders,
		type IAccount,
		type IProvider
	} from '@massalabs/wallet-provider';
	import { ClientFactory } from '@massalabs/massa-web3';

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

		const _accounts = await wallet.accounts();
		if (!_accounts?.length) return;

		selectedWallet = wallet;
		accounts = _accounts;
		return accounts;
	};

	const select = async (selectedAccount: IAccount) => {
		accountStore.set(selectedAccount);
		const client = await ClientFactory.fromWalletProvider(selectedWallet, selectedAccount);
		clientStore.set(client);
		closeModal();
	};

	const disconnect = () => {
		accountStore.set(null);
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
		const acc = await connect(stationWallet || bearbyWallet);
		console.log(acc);
		acc?.length && select(acc[0]);
	});
</script>

<main class="h-screen flex flex-col">
	<header class="flex justify-around items-center p-2">
		<h1>
			<a class="text-2xl" href="/">Massa Tools</a>
		</h1>
		<nav class="flex items-center gap-4">
			<a href="/explorer">Explorer</a>
			<a href="/create">Create</a>
			<a href="/multisig">Multisig</a>
			<a href="/staking">Staking</a>

			<Button
				onClick={() => (showModal = true)}
				text={connectedAddress ? printAddress(connectedAddress) : 'Connect Wallet'}
			/>
		</nav>
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
