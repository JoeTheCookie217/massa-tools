<script lang="ts">
	import '@fontsource-variable/space-grotesk';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { SvelteToastOptions } from '@zerodevx/svelte-toast/stores';
	import ConnectModal from '$lib/components/connect-modal.svelte';
	import LightSwitch from '$lib/components/light-switch/light-switch.svelte';
	import { ExternalLink } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/stores';
	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import '../app.css';

	const options: SvelteToastOptions = {};

	import { dev } from '$app/environment';
	import SearchBar from '$lib/components/search-bar.svelte';
	import { onMount } from 'svelte';
	import clientStore from '$lib/store/client';
	import { CHAIN_NAME, OTHER_CHAIN_DOMAIN, OTHER_CHAIN_NAME } from '$lib/utils/config';
	inject({ mode: dev ? 'development' : 'production' });
	!dev && injectSpeedInsights();

	let currentBlock: number;

	onMount(() => {
		setInterval(() => {
			$clientStore
				.publicApi()
				.getNodeStatus()
				.then((r) => (currentBlock = r.last_slot.period));
		}, 16_000);
	});

	$: url = $page.url.pathname;
</script>

<main class="h-screen flex flex-col">
	<header class="flex justify-around gap-10 items-center p-2 mx-4">
		<nav class="flex items-center gap-6">
			<a class="font-medium text-lg flex items-center gap-1" href="/">
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
			{#each ['create', 'multisig' /*'staking'*/] as link}
				<a
					href="/{link.toLowerCase()}"
					class={cn(
						'text-sm font-medium hover:text-primary transition-colors capitalize',
						!url.includes(link) && ' text-muted-foreground'
					)}>{link}</a
				>
			{/each}
		</nav>
		<SearchBar />
		<div class="flex items-center gap-2">
			<ConnectModal />
			<LightSwitch />
		</div>
	</header>

	<section class="grow grid place-items-center m-12">
		<slot />
	</section>

	<footer class="flex flex-col items-center text-center p-2">
		<p class="text-sm">
			<a
				class="hover:underline"
				target="_blank"
				href="https://github.com/JoeTheCookie217/massa-tools"
			>
				Made with ❤️ by JoeTheCookie217</a
			>
		</p>
		<div class="flex gap-1 text-xs text-green-200">
			<div>
				<span>
					{CHAIN_NAME}
				</span>
				{#if currentBlock}
					<span>
						{currentBlock}
					</span>
				{/if}
			</div>
			<span> - </span>
			<div>
				<a class="flex hover:underline" href={OTHER_CHAIN_DOMAIN} target="_blank" rel="noreferrer">
					<span>{OTHER_CHAIN_NAME} version</span>
					<ExternalLink class="h-4 w-4" />
				</a>
			</div>
		</div>
	</footer>
</main>
<SvelteToast {options} />

<style>
	:global(body) {
		font-family: 'Space Grotesk Variable', sans-serif;
	}
</style>
