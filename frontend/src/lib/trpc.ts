/**
 * tRPC Client Setup
 * Creates the tRPC client for use in React components
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from '@/server/routers/_app';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

const links = [
  httpBatchLink({
    url: '/api/trpc',
    transformer: superjson,
    // Include cookies in requests
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: 'include',
      });
    },
  }),
];

export const trpcClient = trpc.createClient({
  links,
});

export const vanillaTrpc = createTRPCProxyClient<AppRouter>({
  links,
});

