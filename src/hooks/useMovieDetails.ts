
import { useState, useEffect } from 'react';

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

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const useMovieDetails = (movieId: number, contentType: 'movie' | 'tv') => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;

    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        };

        const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}`, { headers }),
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/credits`, { headers }),
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/videos`, { headers })
        ]);

        if (!movieResponse.ok) throw new Error(`Failed to fetch movie details. Status: ${movieResponse.status}`);
        if (!creditsResponse.ok) throw new Error(`Failed to fetch credits. Status: ${creditsResponse.status}`);
        if (!videosResponse.ok) throw new Error(`Failed to fetch videos. Status: ${videosResponse.status}`);

        const movieData = await movieResponse.json();
        const creditsData = await creditsResponse.json();
        const videosData = await videosResponse.json();

        setMovie(movieData);
        setCast(creditsData.cast?.slice(0, 10) || []);
        setVideos(videosData);

      } catch (err) {
        console.error('Error fetching content details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId, contentType]);

  return { movie, cast, videos, loading, error };
};
