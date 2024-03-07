import { trpcApi } from '$lib/utils/config';
import type { AppRouter } from '../../../../global-indexer/api/src/trpc';
import { createTRPCSvelte, httpBatchLink } from 'trpc-svelte-query';

export const trpc = createTRPCSvelte<AppRouter>({
	links: [
		httpBatchLink({
			url: trpcApi
		})
	]
});
