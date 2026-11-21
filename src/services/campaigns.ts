import {
  mapCampaign,
  type ApiCampaign,
  type Campaign,
} from "@/types/api";
import { validateRouteParam } from "../lib/route-params";

/**
 * Framework-agnostic campaign API client.
 *
 * Uses a `fetch`-compatible function so it can be called from a server
 * component or from React Query without a hard dependency on either.
 * The base URL is read from the `NEXT_PUBLIC_API_BASE_URL` environment
 * variable and defaults to localhost for development.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type FetchFn = typeof fetch;

export async function listCampaigns(
  fetchFn: FetchFn = fetch,
): Promise<Campaign[]> {
  const res = await fetchFn(`${API_BASE_URL}/api/campaigns`);
  if (!res.ok) throw new Error(`Failed to fetch campaigns: ${res.status}`);
  const data: ApiCampaign[] = await res.json();
  return data.map(mapCampaign);
}

export async function getCampaign(
  id: string,
  fetchFn: FetchFn = fetch,
): Promise<Campaign> {
  const result = validateRouteParam(id);
  if (!result.ok) throw new Error(result.error);
  const res = await fetchFn(`${API_BASE_URL}/api/campaigns/${result.value}`);
  if (!res.ok) throw new Error(`Failed to fetch campaign ${id}: ${res.status}`);
  const data: ApiCampaign = await res.json();
  return mapCampaign(data);
}
