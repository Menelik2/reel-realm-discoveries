import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpDown,
  Layers,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SEOMetadata } from '@/components/SEOMetadata';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFranchises,
  usePrefetchFranchise,
  franchiseErrorMessage,
  type FranchiseSummary,
} from '@/hooks/useFranchises';
import { cn } from '@/lib/utils';

type SortKey = 'featured' | 'name' | 'titles';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'name', label: 'A–Z' },
  { key: 'titles', label: 'Most titles' },
];

const FranchiseCard = memo(function FranchiseCard({
  franchise,
  onPrefetch,
}: {
  franchise: FranchiseSummary;
  onPrefetch: (slug: string) => void;
}) {
  const titleCount = franchise.content_order?.length || 0;
  const img = franchise.titleImageUrl;

  return (
    <Link
      to={`/franchise/${franchise.slug}`}
      onMouseEnter={() => onPrefetch(franchise.slug)}
      onFocus={() => onPrefetch(franchise.slug)}
      onTouchStart={() => onPrefetch(franchise.slug)}
      className={cn(
        'group relative flex gap-3 sm:gap-4 rounded-2xl overflow-hidden',
        'bg-card/80 border border-border/50 p-3 sm:p-3.5',
        'transition-all duration-200',
        'hover:border-primary/40 hover:bg-card hover:shadow-[var(--card-shadow-hover)]',
        'active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
    >
      {/* Text + meta */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 pr-1">
        <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {franchise.name}
        </h3>
        {franchise.description && (
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {franchise.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-foreground/80">
            {titleCount} {titleCount === 1 ? 'title' : 'titles'}
          </span>
        </div>
      </div>

      {/* Visual */}
      <div className="relative w-[5.5rem] sm:w-28 shrink-0 aspect-[4/3] rounded-xl overflow-hidden bg-secondary">
        {img ? (
          <img
            src={img}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-secondary to-muted flex items-center justify-center">
            <Layers className="h-8 w-8 text-muted-foreground/35" />
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/5 rounded-xl pointer-events-none" />
      </div>
    </Link>
  );
});

const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-3 rounded-2xl border border-border/40 bg-card/50 p-3.5"
      >
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="w-28 aspect-[4/3] rounded-xl shrink-0" />
      </div>
    ))}
  </div>
);

const FranchisesPage = () => {
  const { franchises, loading, isError, error, refetch, isFetching } = useFranchises();
  const prefetch = usePrefetchFranchise();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('featured');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = franchises;
    if (q) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description || '').toLowerCase().includes(q) ||
          f.slug.includes(q)
      );
    }
    if (sort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'titles') {
      list = [...list].sort(
        (a, b) => (b.content_order?.length || 0) - (a.content_order?.length || 0)
      );
    }
    return list;
  }, [franchises, query, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SEOMetadata
        title="Movie & TV Franchises"
        description="Browse film and TV franchises — Marvel, Star Wars, Harry Potter, anime sagas and more."
      />
      <Header
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="container mx-auto px-4 pt-24 pb-28 md:pb-12">
        {/* Hero header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Layers className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Franchises</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl ml-0 md:ml-11">
            Explore complete universes — every title in order, ready to watch.
          </p>
        </div>

        {/* Toolbar */}
        <div className="sticky top-16 z-20 -mx-4 px-4 py-3 mb-5 bg-background/90 backdrop-blur-md border-b border-border/40">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search franchises…"
                className="pl-9 pr-9 h-10 bg-secondary/50 border-border/60"
                disabled={isError && franchises.length === 0}
                aria-label="Search franchises"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              <div className="flex rounded-lg border border-border/60 bg-secondary/40 p-0.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSort(opt.key)}
                    className={cn(
                      'px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
                      sort === opt.key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {!loading && !isError && (
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {filtered.length}
                  {query.trim() ? ` of ${franchises.length}` : ''} franchise
                  {filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {isError && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Could not load franchises</p>
                <p className="text-xs text-destructive/90">{franchiseErrorMessage(error)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Retrying…' : 'Try again'}
            </Button>
          </div>
        )}

        {loading ? (
          <GridSkeleton />
        ) : (
          !isError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((f) => (
                <FranchiseCard key={f.id} franchise={f} onPrefetch={prefetch} />
              ))}
            </div>
          )
        )}

        {!loading && !isError && filtered.length === 0 && (
          <div className="text-center py-20 space-y-2">
            <Layers className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              {query.trim() ? 'No matches' : 'Nothing here yet'}
            </p>
            <p className="text-xs text-muted-foreground">
              {query.trim()
                ? `No franchises match “${query.trim()}”. Try another name.`
                : 'Franchises will appear when the catalog is available.'}
            </p>
            {query.trim() && (
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setQuery('')}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default FranchisesPage;
