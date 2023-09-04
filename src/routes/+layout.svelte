<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { SvelteToastOptions } from '@zerodevx/svelte-toast/stores';
	import ConnectModal from '$lib/components/connect-modal.svelte';
	import LightSwitch from '$lib/components/light-switch/light-switch.svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/stores';
	import ChainSelect from '$lib/components/chain-select.svelte';
	import '../app.css';

	const options: SvelteToastOptions = {};

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
			<ConnectModal />
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
</main>
<SvelteToast {options} />
