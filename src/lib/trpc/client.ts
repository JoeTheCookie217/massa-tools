import { trpcApi } from '$lib/utils/config';
import type { AppRouter } from '../../../../../dex/backend/api/src/trpc';
import { createTRPCProxyClient, createTRPCSvelte, httpBatchLink } from 'trpc-svelte-query';

export const trpc = createTRPCSvelte<AppRouter>({
	links: [
		httpBatchLink({
			url: trpcApi
		})
	]
});
export const trpcClient = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: trpcApi
		})
	]
});
