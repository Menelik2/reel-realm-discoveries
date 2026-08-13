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

/** Shared shell classes – fluid, clamped height across devices */
const HERO_SHELL =
  'relative w-full overflow-hidden ' +
  // aspect + height clamps: phone → tablet → desktop
  'aspect-[16/9] sm:aspect-[21/9] ' +
  'min-h-[180px] sm:min-h-[220px] md:min-h-[260px] ' +
  'max-h-[240px] sm:max-h-[300px] md:max-h-[340px] lg:max-h-[380px]';

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerKeys, setTrailerKeys] = useState<Record<number, string>>({});
  const [isPaused, setIsPaused] = useState(false);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['heroCarousel'],
    queryFn: fetchTrending,
    staleTime: 10 * 60 * 1000,
  });

  // Prefetch trailers for current (+ next) slide
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

  // Autoplay – paused on hover / reduced-motion
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
          <div className="text-muted-foreground text-xs sm:text-sm">Loading...</div>
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
      {/* Responsive background image */}
      <picture className="absolute inset-0 block">
        {backdropPath && (
          <>
            <source
              media="(max-width: 640px)"
              srcSet={`https://image.tmdb.org/t/p/w780${backdropPath}`}
            />
            <source
              media="(max-width: 1024px)"
              srcSet={`https://image.tmdb.org/t/p/w1280${backdropPath}`}
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

      {/* Gradient overlays – stronger on small screens for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10 sm:via-background/35 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent sm:from-background/70 sm:via-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-7 sm:pb-8 md:pb-9 lg:pb-10 pt-4">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-[min(100%,28rem)] sm:max-w-lg md:max-w-xl space-y-1.5 sm:space-y-2 md:space-y-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-primary/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground fill-primary-foreground" />
                <span className="text-[10px] sm:text-xs font-semibold text-primary-foreground">
                  {currentMovie.vote_average.toFixed(1)}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-foreground/70">
                {currentMovie.release_date?.substring(0, 4)}
              </span>
            </div>

            <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-playfair font-bold text-foreground leading-snug line-clamp-2">
              {currentMovie.title}
            </h1>

            <p className="text-[11px] sm:text-xs md:text-sm text-foreground/70 line-clamp-2 max-w-md hidden xs:block sm:block">
              {currentMovie.overview}
            </p>

            <div className="flex gap-2 pt-0.5 sm:pt-1">
              <Button
                size="sm"
                onClick={handleWatchTrailer}
                disabled={!trailerKeys[currentMovie.id]}
                className="rounded-full px-3 sm:px-4 h-7 sm:h-8 gap-1 sm:gap-1.5 text-[11px] sm:text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25"
              >
                <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                <span className="hidden xs:inline sm:inline">Watch Trailer</span>
                <span className="sm:hidden">Trailer</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav arrows – touch-friendly, hide on very narrow if needed */}
      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-1.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-background/35 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/55 active:scale-95 transition-all touch-manipulation"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-1.5 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-background/35 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/55 active:scale-95 transition-all touch-manipulation"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-2.5 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex ? 'true' : undefined}
            className={`h-1.5 sm:h-1.5 rounded-full transition-all duration-300 touch-manipulation ${
              i === currentIndex
                ? 'w-5 sm:w-6 bg-primary'
                : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
            }`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};
