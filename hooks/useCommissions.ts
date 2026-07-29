import { useQuery } from '@tanstack/react-query';
import api from '@/app/services/api';

interface CommissionFilters {
  status?: string;
  role?: 'artist' | 'client';
}

export function useCommissions(filters: CommissionFilters = {}) {
  return useQuery({
    queryKey: ['commissions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      const endpoint = filters.role === 'artist' ? '/commissions/artist' : '/commissions/client';
      const { data } = await api.get(`${endpoint}?${params.toString()}`);
      return data;
    },
  });
}
