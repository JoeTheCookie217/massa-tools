<script lang="ts">
	import '../app.css';
	import { printAddress } from '../utils/methods';
	import { onMount } from 'svelte';
	import Modal from '../components/modal.svelte';
	import { accountStore } from '../store/account';
	import Button from '../components/button.svelte';

	let showModal = false;
	let connectedAddress: string | null = null;
	accountStore.subscribe((account) => {
		connectedAddress = account?.address() || null;
	});

	const onClick = () => (showModal = true);
	const handleClose = () => (showModal = false);
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
				{onClick}
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
			<a href="https://github.com/JoeTheCookie217">JoeTheCookie217</a>
		</p>
	</footer>

	{#if showModal}
		<Modal on:close={handleClose} />
	{/if}
</main>
