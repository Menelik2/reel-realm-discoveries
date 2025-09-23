
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
        
        <div className="relative">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="min-w-[180px] space-y-3 animate-pulse"
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
      
      <div className="relative group">
        <Carousel
          opts={{
            align: "start",
            loop: similarMovies.length > 5,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {similarMovies.map((movie, index) => (
              <CarouselItem 
                key={movie.id} 
                className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="hover-scale">
                  <MovieCard movie={movie} onMovieClick={handleSimilarMovieClick} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 hover:border-border group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
          <CarouselNext className="hidden md:flex -right-4 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 hover:border-border group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
        </Carousel>
      </div>
    </section>
  );
};
