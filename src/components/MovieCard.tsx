import { memo, useMemo } from 'react';
import { Star, Play } from 'lucide-react';
import type { Movie } from '@/types/tmdb';
import { movieGenres, tvGenres } from '@/constants/genres';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movieId: number, mediaType?: 'movie' | 'tv') => void;
  fullPosterUrl?: string;
  /** Fixed width for horizontal rows (e.g. 'w-[140px] sm:w-[160px] md:w-[180px]') */
  className?: string;
}

const getReleaseYear = (date?: string) => {
  if (date && date.length >= 4) return date.substring(0, 4);
  return '';
};

const GENRE_MAP = new Map<number, string>();
movieGenres.forEach((g) => GENRE_MAP.set(g.id, g.name));
tvGenres.forEach((g) => {
  if (!GENRE_MAP.has(g.id)) GENRE_MAP.set(g.id, g.name);
});

export const MovieCard = memo(({ movie, onMovieClick, fullPosterUrl, className }: MovieCardProps) => {
  const posterUrl = fullPosterUrl
    ? fullPosterUrl
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : '/placeholder.svg';

  const posterSrcSet = !fullPosterUrl && movie.poster_path
    ? `https://image.tmdb.org/t/p/w185${movie.poster_path} 185w, https://image.tmdb.org/t/p/w342${movie.poster_path} 342w, https://image.tmdb.org/t/p/w500${movie.poster_path} 500w`
    : undefined;

  const handleCardClick = () => {
    if (onMovieClick) {
      onMovieClick(movie.id, movie.media_type || 'movie');
    }
  };

  const year = getReleaseYear(movie.release_date);
  const isTv = movie.media_type === 'tv';
  const mediaLabel = isTv ? 'TV series' : 'Movie';
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;

  const genreNames = useMemo(() => {
    if (!movie.genre_ids?.length) return [];
    return movie.genre_ids
      .map((id) => GENRE_MAP.get(id))
      .filter(Boolean)
      .slice(0, 2) as string[];
  }, [movie.genre_ids]);

  const ariaLabel = [
    movie.title,
    year || null,
    rating ? `rated ${rating}` : null,
    mediaLabel,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={handleCardClick}
      aria-label={ariaLabel}
      className={cn(
        'group relative w-full text-left focus-ring pressable',
        'rounded-2xl overflow-hidden',
        'ring-1 ring-border/40 dark:ring-white/10',
        'bg-card shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)]',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.04] hover:z-10 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.4)]',
        'hover:ring-primary/30',
        'active:scale-[0.98]',
        className,
      )}
    >
      {/* Full-bleed poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
        <img
          src={posterUrl}
          srcSet={posterSrcSet}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          alt=""
          loading="lazy"
          decoding="async"
          width={342}
          height={513}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Always-on bottom gradient for title readability */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent"
          aria-hidden="true"
        />

        {/* Soft top vignette */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent"
          aria-hidden="true"
        />

        {/* Hover play affordance */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 motion-reduce:transition-none"
          aria-hidden="true"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 ring-2 ring-white/25 scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>

        {/* Rating badge */}
        {rating && (
          <div
            className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2 py-1 border border-white/15 shadow-md"
            aria-hidden="true"
          >
            <Star className="h-3 w-3 text-amber-400 fill-amber-400 drop-shadow" />
            <span className="text-[11px] font-bold text-white tabular-nums tracking-tight">
              {rating}
            </span>
          </div>
        )}

        {/* Media type chip */}
        {isTv && (
          <div
            className="absolute top-2.5 left-2.5 rounded-md bg-primary/90 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm"
            aria-hidden="true"
          >
            Series
          </div>
        )}

        {/* Title + meta on poster */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 space-y-1.5">
          <h3 className="font-bold text-[13px] sm:text-sm leading-snug text-white line-clamp-2 drop-shadow-md tracking-tight">
            {movie.title}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            {year && (
              <span className="text-[11px] font-medium text-white/80 tabular-nums">{year}</span>
            )}
            {genreNames.length > 0 && year && (
              <span className="text-white/35 text-[10px]" aria-hidden="true">
                ·
              </span>
            )}
            {genreNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-white/10 leading-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
});

MovieCard.displayName = 'MovieCard';
