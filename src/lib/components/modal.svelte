<script lang="ts">
	import { onMount } from 'svelte';
	import Button from './button.svelte';
	import { printAddress, printMasBalance } from '$utils/methods';
	import type { IAccount, IProvider } from '@massalabs/wallet-provider';

	// PROPS
	export let connectedAddress: string | undefined;
	export let balance: string | undefined;
	export let closeModal: () => void;
	export let connect: (wallet: IProvider | undefined) => void;
	export let disconnect: () => void;
	export let select: (selectedAccount: IAccount, index: number) => {};
	export let accounts: IAccount[];
	export let stationWallet: IProvider | undefined;
	export let bearbyWallet: IProvider | undefined;

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
		{:else if !accounts || accounts.length === 0}
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
		{/if}
	</div>
</div>
