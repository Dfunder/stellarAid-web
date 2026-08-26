import api from '@/app/services/api';

export type CommissionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface CommissionItem {
  id: string;
  title: string;
  artistName: string;
  artistId?: string;
  status: CommissionStatus;
  budgetUsdc: number;
  createdAt: string;
  rating?: number;
}

export function createCommission(data: {
  artistId: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  attachments?: string[];
}) {
  return api.post('/commissions', data).then((r) => r.data);
}

export function getCommissions(params?: { status?: string; role?: string }) {
  if (params?.role === 'artist') {
    return api
      .get('/commissions/artist', { params: { status: params.status } })
      .then((r) => r.data);
  }

  if (params?.role === 'client') {
    return api
      .get('/commissions/client', { params: { status: params.status } })
      .then((r) => r.data);
  }

  return api.get('/commissions', { params }).then((r) => r.data);
}

function normalizeStatus(value: unknown): CommissionStatus {
  const status = String(value ?? '').toLowerCase();

  if (['pending', 'new_request', 'new', 'requested', 'submitted'].includes(status)) {
    return 'PENDING';
  }

  if (['active', 'in_progress', 'in-progress', 'ongoing', 'accepted'].includes(status)) {
    return 'ACTIVE';
  }

  if (['completed', 'done', 'finished', 'approved'].includes(status)) {
    return 'COMPLETED';
  }

  return 'CANCELLED';
}

export function normalizeCommission(item: unknown, index: number): CommissionItem {
  const entry = (item ?? {}) as Record<string, unknown>;
  const artist = (entry.artist as Record<string, unknown> | undefined) ?? {};

  return {
    id: String(entry.id ?? `commission-${index + 1}`),
    title: String(entry.title ?? entry.name ?? 'Untitled commission'),
    artistName: String(artist.name ?? entry.artistName ?? entry.artist ?? 'Artist'),
    artistId: String(artist.id ?? entry.artistId ?? ''),
    status: normalizeStatus(entry.status),
    budgetUsdc: Number(entry.budgetUsdc ?? entry.budget ?? entry.amount ?? entry.price ?? 0),
    createdAt: String(entry.createdAt ?? entry.created_at ?? entry.updatedAt ?? ''),
    rating: typeof entry.rating === 'number' ? entry.rating : undefined,
  };
}

export function normalizeCommissions(payload: unknown): CommissionItem[] {
  if (Array.isArray(payload)) {
    return payload.map((item, index) => normalizeCommission(item, index));
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const candidate = payload as Record<string, unknown>;
  const commissions = Array.isArray(candidate.commissions)
    ? candidate.commissions
    : Array.isArray(candidate.data)
      ? candidate.data
      : Array.isArray(candidate.items)
        ? candidate.items
        : undefined;

  if (Array.isArray(commissions)) {
    return commissions.map((item, index) => normalizeCommission(item, index));
  }

  return [];
}

export function getCommissionById(id: string) {
  return api.get(`/commissions/${id}`).then((r) => r.data);
}

export function acceptCommission(id: string) {
  return api.patch(`/commissions/${id}/accept`).then((r) => r.data);
}

export function rejectCommission(id: string, reason?: string) {
  return api.patch(`/commissions/${id}/reject`, { reason }).then((r) => r.data);
}

export function submitWork(id: string, data: { message?: string; files?: File[] }) {
  const formData = new FormData();
  if (data.message) formData.append('message', data.message);
  data.files?.forEach((f) => formData.append('files', f));
  return api.patch(`/commissions/${id}/submit`, formData).then((r) => r.data);
}

export function approveWork(id: string) {
  return api.patch(`/commissions/${id}/approve`).then((r) => r.data);
}

export function cancelCommission(id: string) {
  return api.patch(`/commissions/${id}/cancel`).then((r) => r.data);
}
