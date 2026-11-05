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
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group relative block rounded-2xl overflow-hidden text-left focus-ring
        ring-1 ring-border/40 dark:ring-white/10
        bg-card shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)]
        transition-all duration-300 ease-out
        hover:scale-[1.04] hover:z-10 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.4)]
        hover:ring-primary/30 active:scale-[0.98]"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:group-hover:scale-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent"
          aria-hidden
        />

        {/* Rank badge */}
        <div className="absolute top-2.5 left-2.5 z-10 min-w-[2rem] h-8 px-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/30 ring-2 ring-white/20">
          #{rank}
        </div>

        {rating && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-md">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-white tabular-nums">{rating}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 space-y-0.5">
          <h3 className="font-bold text-[13px] sm:text-sm leading-snug text-white line-clamp-2 drop-shadow-md tracking-tight">
            {movie.title}
          </h3>
          {year && (
            <p className="text-[11px] font-medium text-white/80 tabular-nums">{year}</p>
          )}
        </div>
      </div>
    </Link>
  );
};
