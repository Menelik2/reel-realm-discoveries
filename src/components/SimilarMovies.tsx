
import { useState, useEffect } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Film, Tv } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  currentGenres?: number[]; // Current movie/series genres for better matching
  currentRating?: number;   // Current movie/series rating for similarity
  currentYear?: string;     // Current movie/series year for proximity
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const SimilarMovies = ({ movieId, contentType, onMovieClick, currentGenres = [], currentRating = 0, currentYear = '' }: SimilarMoviesProps) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarMovies();
  }, [movieId, contentType]);

  // Calculate similarity score based on multiple factors
  const calculateSimilarityScore = (item: TMDBMovie): number => {
    let score = 0;
    
    // Genre overlap (most important - 50 points max)
    if (currentGenres.length > 0 && item.genre_ids) {
      const genreOverlap = item.genre_ids.filter(genre => currentGenres.includes(genre)).length;
      const genreScore = (genreOverlap / Math.max(currentGenres.length, item.genre_ids.length)) * 50;
      score += genreScore;
    }
    
    // Rating similarity (30 points max)
    if (currentRating > 0 && item.vote_average > 0) {
      const ratingDiff = Math.abs(currentRating - item.vote_average);
      const ratingScore = Math.max(0, 30 - (ratingDiff * 3)); // Penalty for rating difference
      score += ratingScore;
    }
    
    // Release year proximity (20 points max)
    if (currentYear) {
      const itemYear = item.release_date || item.first_air_date || '';
      if (itemYear) {
        const currentYearNum = parseInt(currentYear);
        const itemYearNum = parseInt(itemYear.split('-')[0]);
        if (!isNaN(currentYearNum) && !isNaN(itemYearNum)) {
          const yearDiff = Math.abs(currentYearNum - itemYearNum);
          const yearScore = Math.max(0, 20 - yearDiff); // 1 point penalty per year difference
          score += yearScore;
        }
      }
    }
    
    return score;
  };

  const fetchSimilarMovies = async () => {
    setLoading(true);
    try {
      // Fetch similar, recommended, and discover (by genre) with multiple pages for more results
      const requests = [
        // Similar - pages 1 and 2
        fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/similar?page=1`, {
          headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
          }
        }),
        fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/similar?page=2`, {
          headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
          }
        }),
        // Recommendations - pages 1 and 2
        fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/recommendations?page=1`, {
          headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
          }
        }),
        fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/recommendations?page=2`, {
          headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
          }
        })
      ];
      
      // Add discover by genre if we have genres - multiple pages
      if (currentGenres.length > 0) {
        const genreParam = currentGenres.slice(0, 2).join(','); // Use top 2 genres
        requests.push(
          fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_genres=${genreParam}&sort_by=vote_average.desc&vote_count.gte=100&page=1`, {
            headers: {
              'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
              'Content-Type': 'application/json;charset=utf-8'
            }
          }),
          fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_genres=${genreParam}&sort_by=popularity.desc&vote_count.gte=50&page=1`, {
            headers: {
              'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
              'Content-Type': 'application/json;charset=utf-8'
            }
          })
        );
      }
      
      const responses = await Promise.all(requests);
      
      const dataPromises = responses.map(async (response, index) => {
        if (response.ok) {
          return await response.json();
        }
        return { results: [] };
      });
      
      const allData = await Promise.all(dataPromises);
      
      // Combine all results
      const allResults: TMDBMovie[] = allData.flatMap(data => data.results || []);
      
      // Deduplicate and filter out the current movie/series
      const uniqueResults = allResults
        .filter((item, index, self) => 
          item.id !== movieId && // Don't include the current item
          index === self.findIndex(t => t.id === item.id)
        );
      
      // Calculate similarity scores and sort
      const scoredResults = uniqueResults
        .map(item => ({
          ...item,
          similarityScore: calculateSimilarityScore(item)
        }))
        .sort((a, b) => b.similarityScore - a.similarityScore);
      
      // Normalize and get top 30 most similar results
      const normalizedResults: Movie[] = scoredResults
        .slice(0, 30)
        .map((item: TMDBMovie & { similarityScore: number }) => ({
          id: item.id,
          title: item.title || item.name || 'Unknown Title',
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          release_date: item.release_date || item.first_air_date || '',
          genre_ids: item.genre_ids
        }))
        .filter((item: Movie) => item.title !== 'Unknown Title' && item.poster_path);
      
      setSimilarMovies(normalizedResults);
    } catch (error) {
      console.error('Error fetching similar content:', error);
      setSimilarMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSimilarMovieClick = (movieId: number) => {
    console.log('Similar movie clicked:', movieId);
    onMovieClick(movieId);
  };

  const title = contentType === 'movie' ? 'Similar Movies' : 'Similar TV Series';

  if (loading) {
    return (
      <section className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="space-y-3 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="aspect-[2/3] bg-gradient-to-br from-muted to-muted/60 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (similarMovies.length === 0) {
    return (
      <section className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {contentType === 'movie' ? (
              <Film className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Tv className="h-5 w-5 text-muted-foreground" />
            )}
            <h2 className="text-2xl font-bold text-foreground">
              {title}
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-muted-foreground">
              No similar {contentType === 'movie' ? 'movies' : 'series'} found
            </p>
            <p className="text-sm text-muted-foreground/80">
              Try exploring other categories or check back later
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {similarMovies.length} items
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {similarMovies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="animate-scale-in hover-scale"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <MovieCard movie={movie} onMovieClick={handleSimilarMovieClick} />
          </div>
        ))}
      </div>
    </section>
  );
};
