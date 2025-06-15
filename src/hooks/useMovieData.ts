
import { useQuery } from '@tanstack/react-query';
import { fetchMovies, searchContent } from '@/api/tmdbService';
import { fetchCustomContent } from '@/api/customContentService';

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

  const queryKey = [
    'movies',
    { 
      searchQuery, 
      currentCategory, 
      contentType, 
      selectedGenre, 
      selectedYear, 
      currentPage,
      refreshKey 
    }
  ];

  const queryFn = () => {
    if (searchQuery) {
      return searchContent({ searchQuery, currentPage });
    }
    if (currentCategory === 'custom') {
      return fetchCustomContent();
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
