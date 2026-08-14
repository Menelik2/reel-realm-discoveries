import { memo } from 'react';
import { Star } from 'lucide-react';
import type { Movie } from '@/types/tmdb';

interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movieId: number, mediaType?: 'movie' | 'tv') => void;
  fullPosterUrl?: string;
}

const getReleaseYear = (date?: string) => {
  if (date && date.length >= 4) return date.substring(0, 4);
  return '';
};

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

  return (
    <button
      onClick={handleCardClick}
      className="group relative rounded-lg overflow-hidden bg-card text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-300 hover:scale-[1.03] hover:shadow-[var(--card-shadow-hover)]"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      {/* Poster — content-visibility skips layout/paint for off-screen cards */}
      <div className="card-poster-host relative aspect-[2/3] overflow-hidden">
        <img
          src={posterUrl}
          srcSet={posterSrcSet}
          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 18vw, 150px"
          alt={movie.title}
          loading="lazy"
          decoding="async"
          width={342}
          height={513}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <Star className="h-2.5 w-2.5 text-primary fill-primary" />
            <span className="text-[10px] font-semibold text-foreground">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-1.5 md:p-2 space-y-0.5">
        <h3 className="font-semibold text-[11px] md:text-xs text-card-foreground line-clamp-1">
          {movie.title}
        </h3>
        {year && (
          <p className="text-[10px] text-muted-foreground">{year}</p>
        )}
      </div>
    </button>
  );
});

MovieCard.displayName = 'MovieCard';
