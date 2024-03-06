import type { AppRouter } from '../../../../global-indexer/api/src/trpc';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [httpBatchLink({ url: '/trpc' })]
});
