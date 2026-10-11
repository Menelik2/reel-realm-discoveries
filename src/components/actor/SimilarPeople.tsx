import { Link } from 'react-router-dom';
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
    <section className="mt-10">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-1 h-5 rounded-full bg-primary" />
        <h2 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
          Similar People
        </h2>
        {!loading && (
          <span className="text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full tabular-nums">
            {people.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="media-row">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-[88px] sm:w-[100px] space-y-2 shrink-0">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-2.5 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="media-row-edge">
          <div className="media-row">
            {people.map((p) => (
              <Link
                key={p.id}
                to={`/person/${p.id}`}
                className="group w-[88px] sm:w-[100px] text-center shrink-0"
                title={
                  p.sharedTitles.length
                    ? `Shared: ${p.sharedTitles.join(', ')}`
                    : undefined
                }
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary ring-1 ring-border/40 mb-2 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-[1.03]">
                  {p.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {p.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {p.sharedCount} shared
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
