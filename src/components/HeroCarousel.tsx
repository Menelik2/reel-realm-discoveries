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

/** Compact hero shell – smaller on all breakpoints */
const HERO_SHELL =
  'relative w-full overflow-hidden ' +
  'aspect-[2.8/1] sm:aspect-[3/1] ' +
  'min-h-[120px] sm:min-h-[140px] md:min-h-[160px] ' +
  'max-h-[160px] sm:max-h-[190px] md:max-h-[220px] lg:max-h-[240px]';

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerKeys, setTrailerKeys] = useState<Record<number, string>>({});
  const [isPaused, setIsPaused] = useState(false);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['heroCarousel'],
    queryFn: fetchTrending,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (movies.length === 0) return;
    const ids = [
      movies[currentIndex]?.id,
      movies[(currentIndex + 1) % movies.length]?.id,
    ].filter(Boolean) as number[];

    ids.forEach((id) => {
      if (!trailerKeys[id]) {
        fetchTrailerKey(id).then((key) => {
          if (key) setTrailerKeys((prev) => ({ ...prev, [id]: key }));
        });
      }
    });
  }, [movies, currentIndex]);

  useEffect(() => {
    if (movies.length === 0 || isPaused) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies, isPaused]);

  const nextSlide = useCallback(
    () => setCurrentIndex((p) => (p + 1) % movies.length),
    [movies.length]
  );
  const prevSlide = useCallback(
    () => setCurrentIndex((p) => (p - 1 + movies.length) % movies.length),
    [movies.length]
  );

  if (isLoading || movies.length === 0) {
    return (
      <div className={`${HERO_SHELL} bg-secondary animate-pulse`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const backdropPath = currentMovie.backdrop_path;

  const handleWatchTrailer = () => {
    const key = trailerKeys[currentMovie.id];
    if (key) window.open(`https://www.youtube.com/watch?v=${key}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={HERO_SHELL}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false);
      }}
    >
      <picture className="absolute inset-0 block">
        {backdropPath && (
          <>
            <source
              media="(max-width: 640px)"
              srcSet={`https://image.tmdb.org/t/p/w780${backdropPath}`}
            />
            <img
              src={`https://image.tmdb.org/t/p/w1280${backdropPath}`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
              decoding="async"
              fetchPriority="high"
            />
          </>
        )}
      </picture>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10 sm:via-background/35 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent sm:from-background/70 sm:via-transparent" />

      <div className="relative z-10 h-full flex items-end pb-5 sm:pb-6 md:pb-7 pt-2">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-[min(100%,22rem)] sm:max-w-md space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-0.5 bg-primary/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                <Star className="h-2.5 w-2.5 text-primary-foreground fill-primary-foreground" />
                <span className="text-[10px] font-semibold text-primary-foreground">
                  {currentMovie.vote_average.toFixed(1)}
                </span>
              </div>
              <span className="text-[10px] font-medium text-foreground/70">
                {currentMovie.release_date?.substring(0, 4)}
              </span>
            </div>

            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-playfair font-bold text-foreground leading-snug line-clamp-1 sm:line-clamp-2">
              {currentMovie.title}
            </h1>

            <p className="text-[10px] sm:text-xs text-foreground/70 line-clamp-1 max-w-sm hidden md:block">
              {currentMovie.overview}
            </p>

            <div className="flex gap-2 pt-0.5">
              <Button
                size="sm"
                onClick={handleWatchTrailer}
                disabled={!trailerKeys[currentMovie.id]}
                className="rounded-full px-2.5 sm:px-3 h-6 sm:h-7 gap-1 text-[10px] sm:text-[11px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25"
              >
                <Play className="h-3 w-3 fill-current" />
                Trailer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/35 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/55 active:scale-95 transition-all touch-manipulation"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/35 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/55 active:scale-95 transition-all touch-manipulation"
        onClick={nextSlide}
      >
        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>

      <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {movies.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex ? 'true' : undefined}
            className={`h-1 rounded-full transition-all duration-300 touch-manipulation ${
              i === currentIndex
                ? 'w-4 sm:w-5 bg-primary'
                : 'w-1 bg-foreground/30 hover:bg-foreground/50'
            }`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};
