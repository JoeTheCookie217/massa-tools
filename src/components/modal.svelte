<script lang="ts">
	import { ClientFactory } from '@massalabs/massa-web3';
	import {
		providers as getProviders,
		type IAccount,
		type IProvider
	} from '@massalabs/wallet-provider';
	import { createEventDispatcher, onMount } from 'svelte';
	import { accountStore, clientStore } from '../store/account';
	import Button from './button.svelte';
	import { printAddress, printMasBalance } from '../utils/methods';

	let connectedAddress: string | undefined;
	let balance: string | undefined;
	accountStore.subscribe(async (account) => {
		connectedAddress = account?.address();
		balance = await account?.balance().then((res) => res.finalBalance);
	});

	let providers: IProvider[] = [];
	getProviders().then((res) => {
		providers = res;
	});
	let accounts: IAccount[];
	let selectedWallet: IProvider;
	$: stationWallet = providers.find((provider) => provider.name() === 'MASSASTATION');
	$: bearbyWallet = providers.find((provider) => provider.name() === 'BEARBY');

	const dispatch = createEventDispatcher();
	const closeModal = () => {
		document.body.style.overflow = 'auto';
		dispatch('close');
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeModal();
		}
	};

	let copied = false;
	const copy = () => {
		copied = true;
		connectedAddress && navigator.clipboard.writeText(connectedAddress);
		setTimeout(() => {
			copied = false;
		}, 1000);
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
		const _accounts = await wallet.accounts();
		if (!_accounts?.length) return;

		selectedWallet = wallet;
		accounts = _accounts;
	};

	const select = async (selectedAccount: IAccount) => {
		console.log(selectedAccount);
		accountStore.set(selectedAccount);
		const client = await ClientFactory.fromWalletProvider(selectedWallet, selectedAccount);
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
	on:click={(e) => e.currentTarget === e.target && closeModal()}
>
	<div class="flex flex-col h-80 w-80 p-4 bg-gray-700 rounded-md">
		<div class="flex justify-between items-center p-2">
			{#if !connectedAddress}
				<span>Connect Wallet</span>
			{:else}
				<span>Connected</span>
			{/if}
			<button
				on:click={(e) => {
					e.stopPropagation();
					closeModal();
				}}>X</button
			>
		</div>
		{#if connectedAddress}
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
		{:else if !accounts}
			<div class="flex flex-col gap-4 grow py-6">
				<Button
					class="grow"
					disabled={stationWallet === undefined}
					text="Massa Station"
					onClick={() => connect(stationWallet)}
				/>
				<Button
					class="grow"
					disabled={bearbyWallet === undefined}
					text="Bearby"
					onClick={() => connect(bearbyWallet)}
				/>
			</div>
		{:else}
			{#each accounts as account}
				<div class="flex justify-between items-center p-2">
					<span>{printAddress(account.address())}</span>
					{#await account.balance() then balance}
						<span>{printMasBalance(balance.finalBalance)}</span>
					{:catch error}
						<span>{error.message}</span>
					{/await}
					<Button text="Connect" onClick={() => select(account)} />
				</div>
			{/each}
		{/if}
	</div>
</div>
