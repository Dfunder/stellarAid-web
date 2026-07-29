import api from '@/app/services/api';

export function getArtists(params?: { search?: string; category?: string }) {
  return api.get('/artists', { params }).then((r) => r.data);
}

export function getArtistById(id: string) {
  return api.get(`/artists/${id}`).then((r) => r.data);
}

export function searchArtists(query: string) {
  return api.get('/artists/search', { params: { q: query } }).then((r) => r.data);
}

export function updateArtistProfile(id: string, data: Record<string, unknown>) {
  return api.patch(`/artists/${id}`, data).then((r) => r.data);
}
