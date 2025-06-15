
import { useState, useEffect } from 'react';
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
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;

    const loadMovieDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { movie, cast, videos } = await fetchMovieDetails(movieId, contentType);
        setMovie(movie);
        setCast(cast);
        setVideos(videos);
      } catch (err) {
        console.error('Error fetching content details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [movieId, contentType]);

  return { movie, cast, videos, loading, error };
};
