import { useQuery } from '@tanstack/react-query';
import api from '@/app/services/api';

export function useWalletBalance() {
  return useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const { data } = await api.get('/wallet/balance');
      return data;
    },
    refetchInterval: 30_000,
  });
}
