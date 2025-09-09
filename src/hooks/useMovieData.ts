
import { useQuery } from '@tanstack/react-query';
import { fetchMovies, searchContent } from '@/api/tmdbService';
import { fetchCustomContent } from '@/api/customContentService';
import { useAuth } from './useAuth';

interface UseMovieDataProps {
  searchQuery: string;
  selectedGenre: string;
  selectedYear: string;
  contentType: 'movie' | 'tv';
  currentCategory: string;
  currentPage: number;
  refreshKey?: number;
  enabled?: boolean;
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
}: UseMovieDataProps) => {
  const { user } = useAuth();

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
      userId: user?.id
    }
  ];

  const queryFn = () => {
    if (searchQuery) {
      return searchContent({ searchQuery, currentPage, contentType });
    }
    if (currentCategory === 'custom') {
      return fetchCustomContent(user?.id);
    }
    return fetchMovies({ currentCategory, contentType, selectedGenre, selectedYear, currentPage });
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    enabled: enabled,
    placeholderData: (previousData) => previousData,
  });

  return {
    movies: data?.movies || [],
    totalPages: data?.totalPages || 1,
    loading: isLoading,
  };
};
