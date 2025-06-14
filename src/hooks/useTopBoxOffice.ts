
import { useQuery } from '@tanstack/react-query';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface BoxOfficeMovie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface ApiResponse {
  results: BoxOfficeMovie[];
}

const fetchTopBoxOffice = async (): Promise<BoxOfficeMovie[]> => {
  const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1&region=US`);
  if (!response.ok) {
    // This will be caught by React Query's error handling
    throw new Error('Failed to fetch top box office movies from TMDB');
  }
  const data: ApiResponse = await response.json();
  return data.results;
};

export const useTopBoxOffice = () => {
  return useQuery({
    queryKey: ['topBoxOffice'],
    queryFn: fetchTopBoxOffice,
  });
};
