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
	import { ChainId } from '@dusalabs/sdk';
	import { chainIdToProviders, printAddress, providerToChainId } from '$lib/utils/methods';
	import Modal from '$lib/components/modal.svelte';
	import { accountStore, clientStore } from '$lib/store/account';
	import Button from '$lib/components/button.svelte';
	import networkStore from '$lib/store/network';
	import '../app.css';
	import LightSwitch from '$lib/components/light-switch/light-switch.svelte';

	const options: SvelteToastOptions = {};

	const chains: ChainId[] = Object.values(ChainId).filter(
		(v) => typeof v === 'number'
	) as ChainId[];

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

	let selectedNetwork: ChainId;
	networkStore.subscribe((network) => {
		selectedNetwork = providerToChainId(network.getPublicProviders()[0]);
	});
	const changeChain = (chain: ChainId) =>
		networkStore.update((network) => {
			const newProviders = chainIdToProviders(chain);
			localStorage.setItem('defaultPublicApi', newProviders[0].url);
			network.setCustomProviders(newProviders);
			return network;
		});

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
</script>

<main class="h-screen flex flex-col">
	<header class="flex justify-around items-center p-2">
		<nav class="flex items-center gap-4">
			<a href="/">0xtools</a>
			<a href="/explorer">Explorer</a>
			<a href="/create">Create</a>
			<a href="/multisig">Multisig</a>
			<a href="/staking">Staking</a>
		</nav>
		<div class="flex items-center">
			<div class="flex flex-col gap-1">
				{#each chains as chain}
					<button
						on:click={() => changeChain(chain)}
						class={`${selectedNetwork === chain && 'text-purple-300'} hover:text-purple-200`}
					>
						{ChainId[chain].toLowerCase()}
					</button>
				{/each}
			</div>
			<Button
				onClick={() => (showModal = true)}
				text={connectedAddress ? printAddress(connectedAddress) : 'Connect Wallet'}
			/>
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
