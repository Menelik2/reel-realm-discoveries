import type { ContentType } from '@/types/tmdb';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchMovies, searchContent } from '@/api/tmdbService';
import { fetchCustomContent } from '@/api/customContentService';
import { clampPage, canGoNext } from '@/utils/pagination';

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
  const qc = useQueryClient();
  const isCustom = currentCategory === 'custom';
  const page = clampPage(currentPage);

  const baseKey = {
    searchQuery,
    currentCategory,
    contentType,
    selectedGenre,
    selectedYear,
    refreshKey,
    userId: isCustom ? userId : undefined,
  };

  const queryKey = ['movies', { ...baseKey, currentPage: page }];

  const queryFn = () => {
    if (searchQuery) {
      return searchContent({ searchQuery, currentPage: page });
    }
    if (isCustom) {
      return fetchCustomContent(userId);
    }
    return fetchMovies({
      currentCategory,
      contentType,
      selectedGenre,
      selectedYear,
      currentPage: page,
    });
  };

  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && (!isCustom || !!userId),
    staleTime: 15 * 60 * 1000,
    gcTime: 45 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const totalPages = data?.totalPages || 1;

  // Prefetch next page while the user views the current one
  useEffect(() => {
    if (!enabled || isCustom || !data) return;
    if (!canGoNext(page, totalPages)) return;

    const nextPage = page + 1;
    void qc.prefetchQuery({
      queryKey: ['movies', { ...baseKey, currentPage: nextPage }],
      queryFn: () => {
        if (searchQuery) {
          return searchContent({ searchQuery, currentPage: nextPage });
        }
        return fetchMovies({
          currentCategory,
          contentType,
          selectedGenre,
          selectedYear,
          currentPage: nextPage,
        });
      },
      staleTime: 15 * 60 * 1000,
    });
  }, [
    enabled,
    isCustom,
    data,
    page,
    totalPages,
    qc,
    searchQuery,
    currentCategory,
    contentType,
    selectedGenre,
    selectedYear,
    refreshKey,
    userId,
  ]);

  return {
    movies: data?.movies || [],
    totalPages,
    loading: isLoading,
    isFetching,
    isPlaceholderData,
  };
};
