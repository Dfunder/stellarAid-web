import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Project } from "@/types/api";

interface ListResponse {
  data?: Project[];
  total?: number;
  meta?: { total?: number };
}

async function fetchCampaigns(page: number, limit: number, q?: string) {
  const params: Record<string, any> = { status: 'active', page, limit };
  if (q && q.trim().length > 0) params.q = q.trim();

  const res = await apiClient.get<ListResponse>(`/projects`, { params });

  const payload = res.data as ListResponse | Project[];
  // support several response shapes
  const items: Project[] = Array.isArray(payload) ? payload : payload.data ?? [];
  const total = (payload as ListResponse).total ?? (payload as ListResponse).meta?.total ?? Number(res.headers['x-total-count']) || items.length;

  return { items, total };
}

export function useCampaigns(page: number, limit: number, q?: string) {
  return useQuery({
    queryKey: ["campaigns", page, limit, q ?? ""],
    queryFn: () => fetchCampaigns(page, limit, q),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });
}

export default useCampaigns;
