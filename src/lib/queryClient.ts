/**
 * React Query Configuration
 * Optimized for production environments with intelligent caching and retry strategies
 * 
 * What it does:
 * - Sets global defaults for all queries (caching, retries, stale time)
 * - Implements smart retry logic for failed requests
 * - Configures garbage collection for memory optimization
 * - Handles network state changes
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Production-optimized query client configuration
 */
const queryConfig: DefaultOptions = {
  queries: {
    // How long cached data is considered "fresh" before being marked as stale
    // 5 minutes: Data is fresh for 5 mins, requests use cached data
    staleTime: 1000 * 60 * 5,

    // How long unused query data is kept in memory
    // 10 minutes: Inactive queries are removed after 10 mins to save memory
    gcTime: 1000 * 60 * 10,

    // Number of retries for failed requests
    // Automatically retries failed requests up to 2 times
    retry: 2,

    // Retry delay (exponential backoff)
    // Waits before retrying: 1st retry at 1s, 2nd retry at 2s
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus (user returns to tab)
    refetchOnWindowFocus: true,

    // Refetch when network is reconnected
    refetchOnReconnect: true,

    // Refetch when component mounts if data is stale
    refetchOnMount: 'stale',
  },
  mutations: {
    // Retry mutations on failure
    retry: 1,
    retryDelay: 1000,
  },
};

/**
 * Create and export the query client
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
};

/**
 * Export the queryClient instance
 * Can be used throughout the app
 */
export const queryClient = createQueryClient();

export default queryClient;
