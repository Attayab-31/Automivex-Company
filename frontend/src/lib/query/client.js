import { QueryClient } from "@tanstack/react-query";
import { logger } from "@/lib/monitoring/logger";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError(error) {
        logger.warn("frontend_mutation_error", { error });
      },
    },
  },
});
