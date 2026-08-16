import type { ContentType } from '@/types/tmdb';

import { useQuery } from '@tanstack/react-query';
import { fetchMovies, searchContent } from '@/api/tmdbService';
import { fetchCustomContent } from '@/api/customContentService';

interface UseMovieDataProps {
  searchQuery: string;
  selectedGenre: string;
  selectedYear: string;
  contentType: ContentType;
  currentCategory: string;
  currentPage: number;
  refreshKey?: number;
  enabled?: boolean;
  /** Optional user id for custom lists — avoid useAuth in every row */
  userId?: string;
}

export const useMovieData = ({
  searchQuery,
  selectedGenre,
  selectedYear,
  contentType,
  currentCategory,
  currentPage,
  refreshKey = 0,
  enabled = true,
  userId,
}: UseMovieDataProps) => {
  const isCustom = currentCategory === 'custom';

  const queryKey = [
    'movies',
    {
      searchQuery,
      currentCategory,
      contentType,
      selectedGenre,
      selectedYear,
      currentPage,
      refreshKey,
      userId: isCustom ? userId : undefined,
    },
  ];

  const queryFn = () => {
    if (searchQuery) {
      return searchContent({ searchQuery, currentPage });
    }
    if (isCustom) {
      return fetchCustomContent(userId);
    }
    return fetchMovies({ currentCategory, contentType, selectedGenre, selectedYear, currentPage });
  };

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && (!isCustom || !!userId),
    staleTime: 15 * 60 * 1000,
    gcTime: 45 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    movies: data?.movies || [],
    totalPages: data?.totalPages || 1,
    loading: isLoading,
  };
};
