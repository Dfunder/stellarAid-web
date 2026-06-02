import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Project } from "@/types/api";

interface FeaturedCampaignsResponse {
  data: Project[];
}

interface UseFeaturedCampaignsOptions {
  limit?: number;
  enabled?: boolean;
}

const FEATURED_CAMPAIGNS_QUERY_KEY = ["campaigns", "featured"];

async function fetchFeaturedCampaigns(
  limit: number = 6
): Promise<Project[]> {
  try {
    const response = await apiClient.get<FeaturedCampaignsResponse>(
      `/projects?featured=true&limit=${limit}`
    );

    if (!response?.data?.data) {
      throw new Error("Invalid API response");
    }

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch featured campaigns:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to fetch featured campaigns"
    );
  }
}

export function useFeaturedCampaigns(
  options: UseFeaturedCampaignsOptions = {},
  queryOptions?: Omit<
    UseQueryOptions<Project[], Error>,
    "queryKey" | "queryFn"
  >
) {
  const {
    limit = 6,
    enabled = true,
  } = options;

  return useQuery<Project[], Error>({
    queryKey: [...FEATURED_CAMPAIGNS_QUERY_KEY, limit],

    queryFn: () => fetchFeaturedCampaigns(limit),

    enabled,

    staleTime: 5 * 60 * 1000, // 5 minutes

    gcTime: 10 * 60 * 1000, // 10 minutes cache retention

    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error.message.includes("404")) {
        return false;
      }

      return failureCount < 3;
    },

    retryDelay: (attempt) =>
      Math.min(1000 * 2 ** attempt, 30000),

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,

    placeholderData: (previousData) => previousData,

    ...queryOptions,
  });
}