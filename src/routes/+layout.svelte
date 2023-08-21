<script lang="ts">
	import { providers as getProviders, type IAccount } from '@massalabs/wallet-provider';
	import '../app.css';
	import { Client, ClientFactory } from '@massalabs/massa-web3';
	import { printAddress } from '../utils/methods';
	import { onMount } from 'svelte';

	let client: Client | null = null;
	let connectedAddress: string | null = null;

	onMount(() => {
		connect(); // TODO: run before rendering the page
	});

	const connect = async () => {
		const providers = await getProviders();
		console.log(providers);

		// const bearbyWallet = providers.find((provider) => provider.name() === 'BEARBY');
		// if (!bearbyWallet) return;

		const stationWallet = providers.find((provider) => provider.name() === 'MASSASTATION');
		if (!stationWallet) return;

		const accounts: IAccount[] = await stationWallet.accounts();
		if (!accounts.length) return;

		// The account you want to use
		const selectedAccount = accounts[0];

		// // You initialize your Client
		const massaClient = await ClientFactory.fromWalletProvider(stationWallet, selectedAccount);

		client = massaClient;
		connectedAddress = selectedAccount.address();
	};

	const disconnect = () => {
		// client
		// 	?.wallet()
		// 	.walletInfo()
		// 	.then((e) => console.log(e));
		client = null;
		connectedAddress = null;
	};
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

			<button
				on:click={() => (connectedAddress ? disconnect() : connect())}
				class="bg-purple-300 text-gray-800 ml-1.5 p-1.5 rounded-md"
				>{connectedAddress ? printAddress(connectedAddress) : 'Connect Wallet'}</button
			>
		</nav>
	</header>

	<section class="grow grid place-items-center">
		<slot />
	</section>

	<footer class="text-center p-2">
		<p>
			Made with ❤️ by
			<a href="https://github.com/JoeTheCookie217">JoeTheCookie217</a>
		</p>
	</footer>
</main>
