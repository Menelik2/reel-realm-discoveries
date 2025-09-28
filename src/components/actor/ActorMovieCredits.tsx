
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActorCredit } from '@/hooks/useActorDetails';

interface ActorMovieCreditsProps {
  credits: ActorCredit[];
  onMovieClick?: (movieId: number, contentType: 'movie' | 'tv') => void;
}

export const ActorMovieCredits = ({ credits, onMovieClick }: ActorMovieCreditsProps) => {
  if (credits.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Known For</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {credits.map((credit) => {
            const contentType = credit.title ? 'movie' : 'tv';
            return (
              <div 
                key={credit.id + (credit.character || '')}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onMovieClick?.(credit.id, contentType)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`}
                  srcSet={`
                    https://image.tmdb.org/t/p/w185${credit.poster_path} 185w,
                    https://image.tmdb.org/t/p/w342${credit.poster_path} 342w,
                    https://image.tmdb.org/t/p/w500${credit.poster_path} 500w
                  `}
                  sizes="(max-width: 640px) 185px, (max-width: 768px) 342px, 500px"
                  alt={credit.title || credit.name}
                  className="rounded-lg aspect-[2/3] object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <p className="font-semibold text-sm mt-2 truncate">{credit.title || credit.name}</p>
                <p className="text-xs text-muted-foreground truncate">{credit.character}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
