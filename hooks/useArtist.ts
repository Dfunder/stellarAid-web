import { useQuery } from '@tanstack/react-query';
import api from '@/app/services/api';
import type { Artist } from '@/app/features/artists/artistsSlice';

export function useArtist(artistId: string | undefined) {
  return useQuery<Artist>({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const { data } = await api.get(`/artists/${artistId}`);
      return data;
    },
    enabled: !!artistId,
  });
}
