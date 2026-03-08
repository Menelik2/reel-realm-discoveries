import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import type { Movie } from '@/types/tmdb';

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const fetchTrending = async (): Promise<Movie[]> => {
  const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week`, {
    headers: {
      'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json;charset=utf-8'
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data.results?.slice(0, 5) || [];
};

const fetchTrailerKey = async (movieId: number): Promise<string | null> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
    return trailer?.key || null;
  } catch {
    return null;
  }
};

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerKeys, setTrailerKeys] = useState<Record<number, string>>({});

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['heroCarousel'],
    queryFn: fetchTrending,
    staleTime: 10 * 60 * 1000, // 10 min
  });

  // Fetch trailers lazily after movies load (only for visible + next)
  useEffect(() => {
    if (movies.length === 0) return;
    const currentMovie = movies[currentIndex];
    if (currentMovie && !trailerKeys[currentMovie.id]) {
      fetchTrailerKey(currentMovie.id).then(key => {
        if (key) setTrailerKeys(prev => ({ ...prev, [currentMovie.id]: key }));
      });
    }
  }, [movies, currentIndex]);

  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [movies]);

  const nextSlide = useCallback(() => setCurrentIndex((p) => (p + 1) % movies.length), [movies.length]);
  const prevSlide = useCallback(() => setCurrentIndex((p) => (p - 1 + movies.length) % movies.length), [movies.length]);

  if (isLoading || movies.length === 0) {
    return (
      <div className="relative h-[55vh] md:h-[75vh] bg-secondary animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  const handleWatchTrailer = () => {
    const key = trailerKeys[currentMovie.id];
    if (key) window.open(`https://www.youtube.com/watch?v=${key}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative h-[55vh] md:h-[75vh] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-[1.2s] ease-out"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${currentMovie.backdrop_path})`
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl md:max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 text-primary-foreground fill-primary-foreground" />
                <span className="text-sm font-semibold text-primary-foreground">
                  {currentMovie.vote_average.toFixed(1)}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground/70">
                {currentMovie.release_date?.substring(0, 4)}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-playfair font-bold text-foreground leading-tight line-clamp-2">
              {currentMovie.title}
            </h1>

            <p className="text-sm md:text-base text-foreground/70 line-clamp-2 max-w-lg">
              {currentMovie.overview}
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleWatchTrailer}
                disabled={!trailerKeys[currentMovie.id]}
                className="rounded-full px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch Trailer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav arrows */}
      <button
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/50 transition-colors"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/50 transition-colors"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-8 bg-primary'
                : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
            }`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};
