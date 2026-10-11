import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Star, Info } from 'lucide-react';
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
  return data.results?.slice(0, 6) || [];
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

const HERO_SHELL =
  'relative w-full overflow-hidden ' +
  'aspect-[16/11] sm:aspect-[21/9] md:aspect-[2.4/1] ' +
  'min-h-[280px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[480px] ' +
  'max-h-[380px] sm:max-h-[440px] md:max-h-[520px] lg:max-h-[580px]';

export const HeroCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerKeys, setTrailerKeys] = useState<Record<number, string>>({});
  const [isPaused, setIsPaused] = useState(false);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['heroCarousel'],
    queryFn: fetchTrending,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (movies.length === 0 || isPaused) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6500);
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
      <div className={`${HERO_SHELL} bg-secondary animate-pulse`} role="status" aria-label="Loading featured titles">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary/40 border-t-primary rounded-full animate-spin" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const backdropPath = currentMovie.backdrop_path;

  const handleWatchTrailer = async () => {
    const id = currentMovie.id;
    let key = trailerKeys[id];
    if (!key) {
      key = (await fetchTrailerKey(id)) || undefined;
      if (key) setTrailerKeys((prev) => ({ ...prev, [id]: key! }));
    }
    if (key) window.open(`https://www.youtube.com/watch?v=${key}`, '_blank', 'noopener,noreferrer');
  };

  const handleDetails = () => {
    navigate(`/movie/${currentMovie.id}`);
  };

  return (
    <section
      className={HERO_SHELL}
      aria-roledescription="carousel"
      aria-label="Featured trending movies"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false);
      }}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {movies.length}: {currentMovie.title}
      </div>

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
              className="absolute inset-0 h-full w-full object-cover object-center scale-105 transition-transform duration-[8000ms] ease-out motion-reduce:transition-none motion-reduce:scale-100"
              decoding="async"
              loading="eager"
              fetchPriority="high"
              width={1280}
              height={720}
            />
          </>
        )}
      </picture>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/5" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent sm:from-background/80 sm:via-background/25" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60" aria-hidden="true" />

      <div className="relative z-10 h-full flex items-end pb-10 sm:pb-12 md:pb-14 pt-6">
        <div className="container mx-auto px-4 sm:px-5">
          <div className="max-w-[min(100%,22rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-primary px-2.5 py-1 rounded-full shadow-md shadow-primary/30">
                <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" aria-hidden="true" />
                <span className="text-xs font-bold text-primary-foreground tabular-nums">
                  {currentMovie.vote_average.toFixed(1)}
                </span>
              </div>
              <span className="text-xs font-semibold text-foreground/80 bg-background/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                {currentMovie.release_date?.substring(0, 4)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/15 px-2 py-1 rounded-full">
                Trending
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-playfair font-bold text-foreground leading-[1.15] line-clamp-2 drop-shadow-sm">
              {currentMovie.title}
            </h1>

            <p className="text-sm text-foreground/75 line-clamp-2 max-w-xl hidden sm:block leading-relaxed">
              {currentMovie.overview}
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1.5">
              <Button
                size="sm"
                onClick={handleWatchTrailer}
                className="rounded-full px-5 h-10 gap-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/10 pressable"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                Trailer
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDetails}
                className="rounded-full px-5 h-10 gap-2 text-sm font-semibold bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/70 pressable"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground hover:bg-background/70 active:scale-95 transition-all touch-manipulation shadow-md pressable"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground hover:bg-background/70 active:scale-95 transition-all touch-manipulation shadow-md pressable"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5" role="tablist" aria-label="Slides">
        {movies.map((m, i) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-label={`${m.title}, slide ${i + 1} of ${movies.length}`}
            aria-selected={i === currentIndex}
            className={`h-1.5 rounded-full transition-all duration-400 touch-manipulation ${
              i === currentIndex
                ? 'w-7 bg-primary shadow-sm shadow-primary/40'
                : 'w-1.5 bg-foreground/25 hover:bg-foreground/45'
            }`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </section>
  );
};
