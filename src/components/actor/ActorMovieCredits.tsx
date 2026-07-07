import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export const ActorMovieCredits = ({ credits, onMovieClick }: ActorMovieCreditsProps) => {
  if (credits.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-baseline justify-between space-y-0">
        <CardTitle>Known For</CardTitle>
        <span className="text-sm text-muted-foreground font-mono">
          {credits.length} titles
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="divide-y divide-border">
          {credits.map((credit, idx) => {
            const isMovie = credit.media_type
              ? credit.media_type === 'movie'
              : !!credit.title;
            const contentType: 'movie' | 'tv' = isMovie ? 'movie' : 'tv';
            const title = credit.title || credit.name || '';
            const date = credit.release_date || credit.first_air_date || '';
            const year = date ? date.slice(0, 4) : '';
            const TypeIcon = isMovie ? Film : Tv;

            return (
              <li
                key={`${credit.id}-${credit.character || idx}`}
                onClick={() => onMovieClick?.(credit.id, contentType)}
                className="group flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 cursor-pointer hover:bg-accent/40 transition-colors"
              >
                <span className="w-6 sm:w-8 text-center text-sm font-mono text-muted-foreground tabular-nums">
                  {idx + 1}
                </span>

                <img
                  src={
                    credit.poster_path
                      ? `https://image.tmdb.org/t/p/w154${credit.poster_path}`
                      : '/placeholder.svg'
                  }
                  alt={title}
                  loading="lazy"
                  className="w-12 h-16 sm:w-14 sm:h-20 rounded-md object-cover flex-shrink-0 shadow-sm"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                    {title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-mono">
                    {year && <span>{year}</span>}
                    {year && <span>·</span>}
                    <span className="inline-flex items-center gap-1 uppercase">
                      <TypeIcon className="h-3 w-3" />
                      {isMovie ? 'Movie' : 'TV'}
                    </span>
                  </div>
                  {credit.character && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      as {credit.character}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end flex-shrink-0 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold tabular-nums">
                      {credit.vote_average ? credit.vote_average.toFixed(1) : '—'}
                    </span>
                  </div>
                  {credit.vote_count ? (
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-0.5">
                      {formatVotes(credit.vote_count)}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
};
