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
      className={`group relative rounded-2xl overflow-hidden bg-card text-left focus-ring pressable transition-all duration-300 ease-out hover:scale-[1.03] hover:z-10 ${className || 'w-full'}`}
      style={{ boxShadow: 'var(--card-shadow)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
      }}
    >
      <div className="card-poster-host relative aspect-[2/3] overflow-hidden">
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
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 motion-reduce:transition-none" aria-hidden="true" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 motion-reduce:translate-y-0" aria-hidden="true">
          <div className="w-12 h-12 rounded-full bg-primary/95 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-white/20">
            <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>

        {movie.vote_average > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-sm" aria-hidden="true">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-semibold text-white tabular-nums tracking-tight">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block" aria-hidden="true">
          <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm">
            {movie.title}
          </p>
          {year && (
            <p className="text-white/70 text-[11px] mt-0.5">{year}</p>
          )}
        </div>
      </div>

      <div className="p-2.5 md:p-3 space-y-1.5 sm:group-hover:opacity-0 sm:group-hover:h-0 sm:group-hover:p-0 sm:group-hover:overflow-hidden transition-all duration-300">
        <h3 className="font-semibold text-sm md:text-[15px] leading-snug text-card-foreground line-clamp-2 min-h-[2.5rem]">
          {movie.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          {year && (
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{year}</span>
          )}
          {genreNames.length > 0 && year && (
            <span className="text-muted-foreground/40 text-xs" aria-hidden="true">·</span>
          )}
          {genreNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-secondary/90 text-muted-foreground border border-border/50 leading-none"
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
