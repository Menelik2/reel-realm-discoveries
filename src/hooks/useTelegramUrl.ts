import { useQuery } from '@tanstack/react-query';
import { getTelegramUrlForSeries } from '@/api/telegramService';
import type { Movie } from '@/types/tmdb';

export const useTelegramUrl = (content: Movie | null) => {
  return useQuery({
    queryKey: ['telegram-url', content?.id, content?.media_type, (content as any)?.imdb_id],
    queryFn: () => {
      if (!content || content.media_type !== 'tv') {
        return Promise.resolve(null);
      }
      return getTelegramUrlForSeries(content.id, (content as any)?.imdb_id);
    },
    enabled: !!content && content.media_type === 'tv',
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
};