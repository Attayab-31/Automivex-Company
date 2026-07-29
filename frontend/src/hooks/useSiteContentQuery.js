import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "@/shared/api/siteContentApi";

export function useSiteContentQuery() {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
