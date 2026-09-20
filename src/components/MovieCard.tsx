import { memo, useMemo } from 'react';
import { Star } from 'lucide-react';
import type { Movie } from '@/types/tmdb';
import { movieGenres, tvGenres } from '@/constants/genres';

interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movieId: number, mediaType?: 'movie' | 'tv') => void;
  fullPosterUrl?: string;
}

const getReleaseYear = (date?: string) => {
  if (date && date.length >= 4) return date.substring(0, 4);
  return '';
};

// Combined lookup for movie + TV genres
const GENRE_MAP = new Map<number, string>();
movieGenres.forEach((g) => GENRE_MAP.set(g.id, g.name));
tvGenres.forEach((g) => {
  if (!GENRE_MAP.has(g.id)) GENRE_MAP.set(g.id, g.name);
});

export const MovieCard = memo(({ movie, onMovieClick, fullPosterUrl }: MovieCardProps) => {
  const posterUrl = fullPosterUrl
    ? fullPosterUrl
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : '/placeholder.svg';

  // Serve a smaller poster to phones, larger only where needed
  const posterSrcSet = !fullPosterUrl && movie.poster_path
    ? `https://image.tmdb.org/t/p/w185${movie.poster_path} 185w, https://image.tmdb.org/t/p/w342${movie.poster_path} 342w, https://image.tmdb.org/t/p/w500${movie.poster_path} 500w`
    : undefined;

  const handleCardClick = () => {
    if (onMovieClick) {
      onMovieClick(movie.id, movie.media_type || 'movie');
    }
  };

  const year = getReleaseYear(movie.release_date);

  const genreNames = useMemo(() => {
    if (!movie.genre_ids?.length) return [];
    return movie.genre_ids
      .map((id) => GENRE_MAP.get(id))
      .filter(Boolean)
      .slice(0, 2) as string[];
  }, [movie.genre_ids]);

  return (
    <button
      onClick={handleCardClick}
      className="group relative rounded-xl overflow-hidden bg-card text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-300 hover:scale-[1.04] hover:shadow-[var(--card-shadow-hover)] hover:ring-1 hover:ring-primary/20"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      {/* Poster — content-visibility skips layout/paint for off-screen cards */}
      <div className="card-poster-host relative aspect-[2/3] overflow-hidden">
        <img
          src={posterUrl}
          srcSet={posterSrcSet}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          alt={movie.title}
          loading="lazy"
          decoding="async"
          width={342}
          height={513}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />

        {/* Soft bottom gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/85 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-border/40">
            <Star className="h-3 w-3 text-primary fill-primary" />
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 md:p-3 space-y-1.5">
        <h3 className="font-semibold text-sm md:text-[15px] leading-snug text-card-foreground line-clamp-2 min-h-[2.5rem]">
          {movie.title}
        </h3>

        {/* Year + Genre tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {year && (
            <span className="text-xs text-muted-foreground shrink-0">{year}</span>
          )}
          {genreNames.length > 0 && year && (
            <span className="text-muted-foreground/50 text-xs">·</span>
          )}
          {genreNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-secondary/80 text-muted-foreground border border-border/40 leading-none"
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
