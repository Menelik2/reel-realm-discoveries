import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import type { SimilarPerson } from '@/hooks/useSimilarPeople';

interface Props {
  people: SimilarPerson[];
  loading: boolean;
}

export const SimilarPeople = ({ people, loading }: Props) => {
  if (!loading && people.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-baseline justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Similar People
        </CardTitle>
        {!loading && (
          <span className="text-sm text-muted-foreground font-mono">
            {people.length}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 space-y-2">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
            {people.map((p) => (
              <Link
                key={p.id}
                to={`/person/${p.id}`}
                className="group flex-shrink-0 w-24 text-center snap-start"
                title={
                  p.sharedTitles.length
                    ? `Shared: ${p.sharedTitles.join(', ')}`
                    : undefined
                }
              >
                <Avatar className="h-24 w-24 mx-auto shadow-md ring-2 ring-transparent group-hover:ring-primary transition-all">
                  <AvatarImage
                    src={
                      p.profile_path
                        ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
                        : undefined
                    }
                    alt={p.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="mt-2 text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {p.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">
                  {p.sharedCount} shared
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
