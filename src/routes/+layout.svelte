<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import type { SvelteToastOptions } from '@zerodevx/svelte-toast/stores';
	import ChainSelect from '$lib/components/chain-select.svelte';
	import { inject } from '@vercel/analytics';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';

	const options: SvelteToastOptions = {};

	import { dev } from '$app/environment';
	import Header from '$lib/components/header.svelte';
	inject({ mode: dev ? 'development' : 'production' });

	const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
	<main class="h-screen flex flex-col">
		<Header />

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
</QueryClientProvider>
<SvelteToast {options} />
