import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Project } from "@/types/api";

interface ListResponse {
  data?: Project[];
  total?: number;
  meta?: { total?: number };
}

export async function fetchCampaigns(page: number, limit: number, q?: string, categories?: string[], sort?: string) {
  const params: Record<string, any> = { status: 'active', page, limit };
  if (q && q.trim().length > 0) params.q = q.trim();
  if (categories && categories.length > 0) params.categories = categories.join(',');
  if (sort) params.sort = sort;

  const res = await apiClient.get<ListResponse>(`/projects`, { params });

  const payload = res.data as ListResponse | Project[];
  // support several response shapes
  const items: Project[] = Array.isArray(payload) ? payload : payload.data ?? [];
  const total = (payload as ListResponse).total ?? (payload as ListResponse).meta?.total ?? Number(res.headers['x-total-count']) || items.length;

  return { items, total };
}

export function useCampaigns(page: number, limit: number, q?: string, categories?: string[], sort?: string): UseQueryResult<{ items: Project[]; total: number }, unknown> {
  return useQuery<{ items: Project[]; total: number }, unknown>({
    queryKey: ["campaigns", page, limit, q ?? "", (categories || []).slice().sort().join(','), sort ?? ""],
    queryFn: () => fetchCampaigns(page, limit, q, categories, sort),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });
}

export default useCampaigns;
