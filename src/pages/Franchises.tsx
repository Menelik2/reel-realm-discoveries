import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Layers, RefreshCw, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SEOMetadata } from '@/components/SEOMetadata';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFranchises,
  franchiseErrorMessage,
  type FranchiseSummary,
} from '@/hooks/useFranchises';

const FranchiseCard = ({ franchise }: { franchise: FranchiseSummary }) => {
  const titleCount = franchise.content_order?.length || 0;
  const img = franchise.titleImageUrl;

  return (
    <Link
      to={`/franchise/${franchise.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-[var(--card-shadow-hover)] hover:scale-[1.02]"
    >
      <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
        {img ? (
          <img
            src={img}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary to-background flex items-center justify-center">
            <Layers className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {franchise.name}
          </h3>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {franchise.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {franchise.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/80">{titleCount} titles</span>
        </div>
      </div>
    </Link>
  );
};

const FranchisesPage = () => {
  const { franchises, loading, isError, error, refetch, isFetching } = useFranchises();
  const [query, setQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return franchises;
    return franchises.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q) ||
        f.slug.includes(q)
    );
  }, [franchises, query]);

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
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Franchises</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Explore major film and series universes. Tap a franchise to see every title in order.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search franchises…"
              className="pl-9 h-10 bg-secondary/50 border-border/60"
              disabled={isError && franchises.length === 0}
            />
          </div>
          {!loading && !isError && (
            <p className="text-xs text-muted-foreground">
              {filtered.length} franchise{filtered.length !== 1 ? 's' : ''}
              {query.trim() ? ' matched' : ''}
            </p>
          )}
        </div>

        {isError && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border/40">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isError && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((f) => (
                <FranchiseCard key={f.id} franchise={f} />
              ))}
            </div>
          )
        )}

        {!loading && !isError && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {query.trim()
              ? `No franchises match “${query.trim()}”.`
              : 'No franchises available right now.'}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default FranchisesPage;
