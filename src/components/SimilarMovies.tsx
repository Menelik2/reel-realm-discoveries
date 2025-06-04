
import { useState, useEffect } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

interface SimilarMoviesProps {
  movieId: number;
  contentType: 'movie' | 'tv';
  onMovieClick: (movieId: number) => void;
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const SimilarMovies = ({ movieId, contentType, onMovieClick }: SimilarMoviesProps) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarMovies();
  }, [movieId, contentType]);

  const fetchSimilarMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/similar?page=1`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Normalize the data to ensure required fields are present
      const normalizedResults: Movie[] = data.results?.slice(0, 10).map((item: TMDBMovie) => ({
        id: item.id,
        title: item.title || item.name || 'Unknown Title',
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date || '',
        genre_ids: item.genre_ids
      })).filter((item: Movie) => item.title !== 'Unknown Title') || [];
      
      setSimilarMovies(normalizedResults);
    } catch (error) {
      console.error('Error fetching similar content:', error);
      setSimilarMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const title = contentType === 'movie' ? 'Similar Movies' : 'Similar TV Series';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarMovies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No similar {contentType === 'movie' ? 'movies' : 'series'} found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {similarMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
