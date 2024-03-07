import type { AppRouter } from '../../../../global-indexer/api/src/trpc';
import { svelteQueryWrapper } from 'trpc-svelte-query-adapter';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { trpcApi } from '$lib/utils/config';

const client = createTRPCProxyClient<AppRouter>({
	links: [httpBatchLink({ url: trpcApi })]
});
export const trpc = svelteQueryWrapper<AppRouter>({ client });
