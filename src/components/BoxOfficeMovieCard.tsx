import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { BoxOfficeMovie } from '@/hooks/useTopBoxOffice';

interface BoxOfficeMovieCardProps {
  movie: BoxOfficeMovie;
  rank: number;
}

export const BoxOfficeMovieCard = ({ movie, rank }: BoxOfficeMovieCardProps) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  const year = movie.release_date?.slice(0, 4) || '';

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group relative block rounded-2xl overflow-hidden bg-card text-left transition-all duration-300 hover:scale-[1.03] hover:z-10 focus-ring"
      style={{ boxShadow: 'var(--card-shadow)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
      }}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rank badge */}
        <div className="absolute top-2.5 left-2.5 z-10 min-w-[2rem] h-8 px-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/30 ring-2 ring-background/80">
          {rank}
        </div>

        {movie.vote_average > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-semibold text-white tabular-nums">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 md:p-3 space-y-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {movie.title}
        </h3>
        {year && (
          <p className="text-xs text-muted-foreground tabular-nums">{year}</p>
        )}
      </div>
    </Link>
  );
};
