import { QueryClient } from "@tanstack/react-query";

// Simple QueryClient for client-side only app
// No API requests - all data is stored in localStorage
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
