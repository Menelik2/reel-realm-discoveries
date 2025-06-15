
import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetails } from '@/api/tmdbService';

interface MovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; name: string }[];
  budget?: number;
  revenue?: number;
  tagline?: string;
  homepage?: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface Videos {
  results: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  }[];
}

export const useMovieDetails = (movieId: number, contentType: 'movie' | 'tv') => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['movieDetails', movieId, contentType],
    queryFn: () => fetchMovieDetails(movieId, contentType),
    enabled: !!movieId,
  });

  return {
    movie: data?.movie || null,
    cast: data?.cast || [],
    videos: data?.videos || null,
    loading: isLoading,
    error: isError ? (error as Error).message : null,
  };
};
