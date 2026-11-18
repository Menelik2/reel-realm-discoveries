import { memo, useMemo } from 'react';
import { Star, Play } from 'lucide-react';
import type { Movie } from '@/types/tmdb';
import { movieGenres, tvGenres } from '@/constants/genres';

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
  const mediaLabel = movie.media_type === 'tv' ? 'TV series' : 'Movie';

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
    movie.vote_average > 0 ? `rated ${movie.vote_average.toFixed(1)}` : null,
    mediaLabel,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={handleCardClick}
      aria-label={ariaLabel}
      className={`group relative isolate flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-card text-left focus-ring pressable transition-all duration-300 ease-out sm:hover:scale-[1.03] sm:hover:z-10 active:scale-[0.98] ${className || 'w-full'}`}
      style={{ boxShadow: 'var(--card-shadow)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
      }}
    >
      <div className="card-poster-host relative aspect-[2/3] overflow-hidden bg-zinc-900">
        <img
          src={posterUrl}
          srcSet={posterSrcSet}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          alt=""
          loading="lazy"
          decoding="async"
          width={342}
          height={513}
          className="w-full h-full object-cover transition-transform duration-500 ease-out sm:group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 motion-reduce:transition-none" aria-hidden="true" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-2 sm:group-hover:translate-y-0 motion-reduce:translate-y-0" aria-hidden="true">
          <div className="w-12 h-12 rounded-full bg-primary/95 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-white/20">
            <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>

        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-lg" aria-hidden="true">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-semibold text-white tabular-nums tracking-tight">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 hidden sm:block" aria-hidden="true">
          <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm">
            {movie.title}
          </p>
          {year && (
            <p className="text-white/70 text-[11px] mt-0.5">{year}</p>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[1] flex min-h-[76px] flex-col justify-end p-2.5 text-left sm:hidden" aria-hidden="true">
        <h3 className="min-h-[2.35em] text-left text-[13px] font-bold leading-[1.18] tracking-[-0.01em] text-white line-clamp-2 [overflow-wrap:anywhere] drop-shadow-lg">
          {movie.title}
        </h3>
        <div className="mt-1.5 flex h-4 min-w-0 items-center gap-1.5 overflow-hidden text-left text-[10px] font-medium leading-none tracking-wide text-white/75">
          {year && <span className="shrink-0 tabular-nums">{year}</span>}
          {year && genreNames.length > 0 && <span className="shrink-0 text-white/45">·</span>}
          {genreNames.length > 0 && <span className="truncate">{genreNames[0]}</span>}
        </div>
      </div>

      <div className="hidden min-h-[88px] flex-1 flex-col p-3 text-left sm:flex md:p-3.5 sm:group-hover:opacity-0 sm:group-hover:h-0 sm:group-hover:min-h-0 sm:group-hover:p-0 sm:group-hover:overflow-hidden transition-all duration-300">
        <h3 className="min-h-[2.6rem] text-left text-[14px] font-semibold leading-[1.3] tracking-[-0.015em] text-card-foreground line-clamp-2 [overflow-wrap:anywhere]">
          {movie.title}
        </h3>

        <div className="mt-auto flex min-h-5 flex-nowrap items-center gap-1.5 overflow-hidden pt-2">
          {year && (
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{year}</span>
          )}
          {genreNames.length > 0 && year && (
            <span className="text-muted-foreground/40 text-xs" aria-hidden="true">·</span>
          )}
          {genreNames.map((name) => (
            <span
              key={name}
              className="inline-flex max-w-[92px] shrink-0 items-center truncate rounded-md border border-border/50 bg-secondary/90 px-1.5 py-1 text-[10px] font-medium leading-none text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
});

MovieCard.displayName = 'MovieCard';
