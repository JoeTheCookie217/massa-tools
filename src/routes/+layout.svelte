<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { SvelteToastOptions } from '@zerodevx/svelte-toast/stores';
	import ConnectModal from '$lib/components/connect-modal.svelte';
	import LightSwitch from '$lib/components/light-switch/light-switch.svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/stores';
	import ChainSelect from '$lib/components/chain-select.svelte';
	import { inject } from '@vercel/analytics';
	import '../app.css';

	const options: SvelteToastOptions = {};

	import { dev } from '$app/environment';
	inject({ mode: dev ? 'development' : 'production' });

	$: url = $page.url.pathname;
</script>

<main class="h-screen flex flex-col">
	<header class="flex justify-around items-center p-2">
		<nav class="flex items-center gap-8">
			<a class="font-medium text-lg flex items-center gap-2" href="/">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="h-6 w-6">
					<rect width="256" height="256" fill="none" />
					<line
						x1="208"
						y1="128"
						x2="128"
						y2="208"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="16"
					/>
					<line
						x1="192"
						y1="40"
						x2="40"
						y2="192"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="16"
					/>
				</svg>
				<span>massa-tools</span>
			</a>
			{#each ['explorer', 'create', 'multisig' /* , 'staking' */] as link}
				<a
					href="/{link.toLowerCase()}"
					class={cn(
						'text-sm font-medium hover:text-primary transition-colors capitalize',
						!url.includes(link) && ' text-muted-foreground'
					)}>{link}</a
				>
			{/each}
		</nav>
		<div class="flex items-center gap-2">
			<ConnectModal />
			<ChainSelect />
			<LightSwitch />
		</div>
	</header>

	<section class="grow grid place-items-center">
		<slot />
	</section>

	<footer class="text-center p-2">
		<p class="text-sm">
			<a
				class="hover:underline"
				target="_blank"
				href="https://github.com/JoeTheCookie217/massa-tools"
			>
				Made with ❤️ by JoeTheCookie217</a
			>
		</p>
	</footer>
</main>
<SvelteToast {options} />
