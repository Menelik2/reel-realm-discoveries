
import { useQuery } from '@tanstack/react-query';
import { fetchMovies, searchContent } from '@/api/tmdbService';
import { fetchCustomContent } from '@/api/customContentService';
import { fetchStreamingMovies, searchStreamingContent, fetchTrendingStreaming } from '@/api/streamingAvailabilityService';

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

  const queryFn = async () => {
    if (searchQuery) {
      // Combine search results from both APIs
      const [tmdbResults, streamingResults] = await Promise.allSettled([
        searchContent({ searchQuery, currentPage }),
        searchStreamingContent(searchQuery, currentPage)
      ]);

      const tmdbMovies = tmdbResults.status === 'fulfilled' ? tmdbResults.value.movies : [];
      const streamingMovies = streamingResults.status === 'fulfilled' ? streamingResults.value.movies : [];
      
      // Remove duplicates based on title and merge results
      const allMovies = [...tmdbMovies];
      streamingMovies.forEach(streamingMovie => {
        const isDuplicate = tmdbMovies.some(tmdbMovie => 
          tmdbMovie.title.toLowerCase() === streamingMovie.title.toLowerCase()
        );
        if (!isDuplicate) {
          allMovies.push(streamingMovie);
        }
      });

      return {
        movies: allMovies,
        totalPages: Math.max(
          tmdbResults.status === 'fulfilled' ? tmdbResults.value.totalPages : 1,
          streamingResults.status === 'fulfilled' ? streamingResults.value.totalPages : 1
        )
      };
    }
    
    if (currentCategory === 'custom') {
      return fetchCustomContent();
    }
    
    if (currentCategory === 'streaming') {
      return fetchTrendingStreaming(contentType);
    }
    
    // For regular categories, combine TMDB and streaming results
    const [tmdbResults, streamingResults] = await Promise.allSettled([
      fetchMovies({ currentCategory, contentType, selectedGenre, selectedYear, currentPage }),
      fetchStreamingMovies({ contentType, genre: selectedGenre, year: selectedYear, page: currentPage })
    ]);

    const tmdbMovies = tmdbResults.status === 'fulfilled' ? tmdbResults.value.movies : [];
    const streamingMovies = streamingResults.status === 'fulfilled' ? streamingResults.value.movies : [];
    
    // Merge results, prioritizing TMDB but adding unique streaming content
    const allMovies = [...tmdbMovies];
    streamingMovies.forEach(streamingMovie => {
      const isDuplicate = tmdbMovies.some(tmdbMovie => 
        tmdbMovie.title.toLowerCase() === streamingMovie.title.toLowerCase()
      );
      if (!isDuplicate && allMovies.length < 40) { // Limit total results
        allMovies.push(streamingMovie);
      }
    });

    return {
      movies: allMovies,
      totalPages: tmdbResults.status === 'fulfilled' ? tmdbResults.value.totalPages : 1
    };
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
