import api from '@/app/services/api';

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
  return api.get('/commissions', { params }).then((r) => r.data);
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
