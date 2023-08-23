<script lang="ts">
	import { ClientFactory } from '@massalabs/massa-web3';
	import { providers as getProviders, type IProvider } from '@massalabs/wallet-provider';
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

	let providers: IProvider[] = [];
	getProviders().then((res) => {
		providers = res;
	});
	$: stationWallet = providers.find((provider) => provider.name() === 'MASSASTATION');
	$: bearbyWallet = providers.find((provider) => provider.name() === 'BEARBY');

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

	const connect = async (wallet: IProvider | undefined) => {
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
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="absolute h-full w-full bg-black bg-opacity-90 z-50 grid place-items-center"
	on:click={closeModal}
>
	<div class="flex flex-col h-80 w-80 bg-gray-700 rounded-md">
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
			<div class="flex flex-col gap-4 grow">
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
		{/if}
	</div>
</div>
