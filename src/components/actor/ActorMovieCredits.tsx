
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActorCredit } from '@/hooks/useActorDetails';

interface ActorMovieCreditsProps {
  credits: ActorCredit[];
}

export const ActorMovieCredits = ({ credits }: ActorMovieCreditsProps) => {
  if (credits.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Known For</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {credits.map((credit) => (
            <div key={credit.id + (credit.character || '')}>
              <img
                src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`}
                alt={credit.title || credit.name}
                className="rounded-lg aspect-[2/3] object-cover"
                loading="lazy"
              />
              <p className="font-semibold text-sm mt-2 truncate">{credit.title || credit.name}</p>
              <p className="text-xs text-muted-foreground truncate">{credit.character}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
