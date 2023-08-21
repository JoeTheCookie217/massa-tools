<script lang="ts">
	import { ClientFactory } from '@massalabs/massa-web3';
	import { providers as getProviders, type IAccount } from '@massalabs/wallet-provider';
	import { createEventDispatcher, onMount } from 'svelte';
	import { accountStore, clientStore } from '../store/account';
	import Button from './button.svelte';
	import { printAddress } from '../utils/methods';

	const dispatch = createEventDispatcher();

	let connectedAddress: string | null = null;
	accountStore.subscribe((account) => {
		console.log(account);
		if (account?.address()) connectedAddress = account.address();
	});

	const closeModal = () => {
		document.body.style.overflow = 'auto';
		dispatch('close');
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeModal();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	// onMount(() => {
	// 	connect(); // TODO: run before rendering the page
	// });

	const connect = async () => {
		const providers = await getProviders();
		console.log(providers);

		const stationWallet = providers.find((provider) => provider.name() === 'MASSASTATION');
		const bearbyWallet = providers.find((provider) => provider.name() === 'BEARBY');
		const wallet = stationWallet || bearbyWallet;
		console.log(wallet);
		if (!wallet) return;

		// const stationAccounts = await stationWallet?.accounts();
		// const bearbyAccounts = await bearbyWallet?.accounts();
		// if (!bearbyAccounts?.length && !stationAccounts?.length) return;
		const accounts = await wallet.accounts();
		console.log(accounts);
		if (!accounts?.length) return;

		const selectedAccount = accounts[0];
		accountStore.set(selectedAccount);
		const client = await ClientFactory.fromWalletProvider(wallet, selectedAccount);
		clientStore.set(client);
		closeModal();
	};

	const disconnect = () => {
		accountStore.set(null);

		closeModal();
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="absolute h-full w-full bg-black bg-opacity-90 z-50 grid place-items-center"
	on:click={closeModal}
>
	<div class="h-80 w-80 bg-gray-700 rounded-md">
		<div class="flex justify-between items-center p-2">
			<span>Connect Wallet</span>
			<button
				on:click={(e) => {
					e.stopPropagation();
					closeModal();
				}}>X</button
			>
		</div>
		{#if connectedAddress}
			<div class="flex justify-between items-center p-2">
				<span>{printAddress(connectedAddress)}</span>
				<Button text="Disconnect" onClick={disconnect} />
			</div>
		{:else}
			<Button text="Connect" onClick={connect} />
		{/if}
	</div>
</div>
