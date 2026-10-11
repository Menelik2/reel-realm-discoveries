import { Link } from 'react-router-dom';
import { Star, Film, Tv } from 'lucide-react';
import type { ActorCredit } from '@/hooks/useActorDetails';

interface ActorMovieCreditsProps {
  credits: ActorCredit[];
  onMovieClick?: (movieId: number, contentType: 'movie' | 'tv') => void;
}

const formatVotes = (n?: number) => {
  if (!n) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${n}`;
};

const resolveContentType = (credit: ActorCredit): 'movie' | 'tv' => {
  if (credit.media_type === 'movie' || credit.media_type === 'tv') {
    return credit.media_type;
  }
  if (credit.title || credit.release_date) return 'movie';
  if (credit.name || credit.first_air_date) return 'tv';
  return 'movie';
};

export const ActorMovieCredits = ({ credits, onMovieClick }: ActorMovieCreditsProps) => {
  if (credits.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-1 h-5 rounded-full bg-primary" />
        <h2 className="text-lg md:text-xl font-bold tracking-tight">Known For</h2>
        <span className="text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full tabular-nums">
          {credits.length}
        </span>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/80 overflow-hidden shadow-sm">
        <ol className="divide-y divide-border/50">
          {credits.map((credit, idx) => {
            const contentType = resolveContentType(credit);
            const isMovie = contentType === 'movie';
            const title = credit.title || credit.name || 'Untitled';
            const date = credit.release_date || credit.first_air_date || '';
            const year = date ? date.slice(0, 4) : '';
            const TypeIcon = isMovie ? Film : Tv;
            const hasValidId = typeof credit.id === 'number' && credit.id > 0;
            const to = hasValidId ? `/${contentType}/${credit.id}` : undefined;

            const rowInner = (
              <>
                <span className="w-6 sm:w-8 text-center text-xs font-semibold text-muted-foreground tabular-nums">
                  {idx + 1}
                </span>

                <img
                  src={
                    credit.poster_path
                      ? `https://image.tmdb.org/t/p/w154${credit.poster_path}`
                      : '/placeholder.svg'
                  }
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                  }}
                  className="w-11 h-[66px] sm:w-12 sm:h-[72px] rounded-lg object-cover flex-shrink-0 ring-1 ring-border/40 bg-secondary"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    {year && <span className="tabular-nums">{year}</span>}
                    {year && <span className="opacity-40">·</span>}
                    <span className="inline-flex items-center gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {isMovie ? 'Movie' : 'TV'}
                    </span>
                  </div>
                  {credit.character && (
                    <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                      as {credit.character}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end flex-shrink-0 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold tabular-nums">
                      {credit.vote_average ? credit.vote_average.toFixed(1) : '—'}
                    </span>
                  </div>
                  {credit.vote_count ? (
                    <span className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                      {formatVotes(credit.vote_count)}
                    </span>
                  ) : null}
                </div>
              </>
            );

            const rowClasses =
              'group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 transition-colors';

            return (
              <li key={`${credit.id}-${credit.character || idx}`}>
                {to ? (
                  <Link
                    to={to}
                    onClick={() => hasValidId && onMovieClick?.(credit.id, contentType)}
                    className={`${rowClasses} cursor-pointer hover:bg-accent/40`}
                  >
                    {rowInner}
                  </Link>
                ) : (
                  <div
                    className={`${rowClasses} opacity-60 cursor-not-allowed`}
                    aria-disabled="true"
                    title="Detail page unavailable"
                  >
                    {rowInner}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
