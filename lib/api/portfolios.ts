import api from '@/app/services/api';

export function getPortfolios(params?: { artistId?: string }) {
  return api.get('/portfolios', { params }).then((r) => r.data);
}

export function getPortfolioById(id: string) {
  return api.get(`/portfolios/${id}`).then((r) => r.data);
}

export function createPortfolio(data: {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  coverImage?: string;
  items?: { imageUrl: string; title: string; description?: string }[];
}) {
  return api.post('/portfolios', data).then((r) => r.data);
}

export function updatePortfolio(id: string, data: Record<string, unknown>) {
  return api.patch(`/portfolios/${id}`, data).then((r) => r.data);
}

export function publishPortfolio(id: string) {
  return api.patch(`/portfolios/${id}`, { status: 'published' }).then((r) => r.data);
}
