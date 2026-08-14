import { memo, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Clapperboard,
  Layers,
  Loader2,
  RefreshCw,
  Star,
  Tv,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SEOMetadata } from '@/components/SEOMetadata';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFranchise,
  franchiseErrorMessage,
  isNotFoundError,
  type FranchiseContentItem,
} from '@/hooks/useFranchises';
import { searchContent } from '@/api/tmdbService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const yearOf = (date: string | null) => (date && date.length >= 4 ? date.slice(0, 4) : '');

const FranchiseTitleCard = memo(function FranchiseTitleCard({
  item,
  index,
  onOpen,
  resolving,
}: {
  item: FranchiseContentItem;
  index: number;
  onOpen: (item: FranchiseContentItem) => void;
  resolving: boolean;
}) {
  const year = yearOf(item.release_date);
  const rating = item.mean_rating;
  const isSeries = item.content_type === 'SERIES';

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      disabled={resolving}
      className={cn(
        'group relative rounded-xl overflow-hidden bg-card text-left w-full',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'transition-all duration-200 hover:scale-[1.03] hover:shadow-[var(--card-shadow-hover)]',
        'disabled:opacity-70 disabled:pointer-events-none'
      )}
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <div className="relative aspect-[2/3] overflow-hidden card-poster-host bg-secondary">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading={index < 8 ? 'eager' : 'lazy'}
            decoding="async"
            width={342}
            height={513}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Order badge */}
        <div className="absolute top-1.5 left-1.5 min-w-[1.35rem] h-5 px-1 rounded-md bg-background/85 backdrop-blur-sm flex items-center justify-center">
          <span className="text-[10px] font-bold tabular-nums text-foreground">{index + 1}</span>
        </div>

        {resolving && (
          <div className="absolute inset-0 bg-background/65 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {rating != null && rating > 0 && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-background/85 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <Star className="h-2.5 w-2.5 text-primary fill-primary" />
            <span className="text-[10px] font-semibold text-foreground">{rating.toFixed(1)}</span>
          </div>
        )}

        <div className="absolute bottom-1.5 left-1.5">
          <span className="inline-flex items-center gap-0.5 rounded-md bg-background/80 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {isSeries ? <Tv className="h-2.5 w-2.5" /> : <Clapperboard className="h-2.5 w-2.5" />}
            {isSeries ? 'Series' : 'Movie'}
          </span>
        </div>
      </div>
      <div className="p-1.5 md:p-2 space-y-0.5">
        <h3 className="font-semibold text-[11px] md:text-xs text-card-foreground line-clamp-2 leading-snug">
          {item.title}
        </h3>
        {year && <p className="text-[10px] text-muted-foreground">{year}</p>}
      </div>
    </button>
  );
});

const FranchiseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { franchise, loading, isOptimistic, isError, error, refetch, isFetching } = useFranchise(slug);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const titles = useMemo(() => {
    if (!franchise?.content?.length) return [];
    const byId = new Map(franchise.content.map((c) => [c.content_id, c]));
    if (franchise.content_order?.length) {
      const ordered = franchise.content_order
        .map((id) => byId.get(id))
        .filter(Boolean) as FranchiseContentItem[];
      if (ordered.length) return ordered;
    }
    return franchise.content;
  }, [franchise]);

  const yearRange = useMemo(() => {
    const years = titles
      .map((t) => yearOf(t.release_date))
      .filter(Boolean)
      .map(Number)
      .filter((y) => y > 1900);
    if (!years.length) return null;
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? String(min) : `${min}–${max}`;
  }, [titles]);

  const avgRating = useMemo(() => {
    const rated = titles.filter((t) => t.mean_rating != null && t.mean_rating > 0);
    if (!rated.length) return null;
    const sum = rated.reduce((a, t) => a + (t.mean_rating || 0), 0);
    return sum / rated.length;
  }, [titles]);

  const movieCount = useMemo(
    () => titles.filter((t) => t.content_type !== 'SERIES').length,
    [titles]
  );
  const seriesCount = useMemo(
    () => titles.filter((t) => t.content_type === 'SERIES').length,
    [titles]
  );

  const heroBackdrop = titles.find((t) => t.backdrop)?.backdrop || titles[0]?.poster || null;

  const handleOpen = async (item: FranchiseContentItem) => {
    if (!item.title?.trim()) {
      toast.error('This title has no name and cannot be opened.');
      return;
    }
    if (resolvingId != null) return;

    setResolvingId(item.content_id);
    try {
      const preferTv = item.content_type === 'SERIES';
      const { movies } = await searchContent({
        searchQuery: item.title,
        currentPage: 1,
        contentType: preferTv ? 'tv' : undefined,
      });
      if (!Array.isArray(movies) || movies.length === 0) {
        toast.error('Could not find this title. Try searching for it instead.');
        return;
      }

      const year = yearOf(item.release_date);
      const titleLower = item.title.toLowerCase();
      const match =
        movies.find((m) => {
          const t = (m.title || m.name || '').toLowerCase();
          const y = (m.release_date || m.first_air_date || '').slice(0, 4);
          const typeOk = preferTv
            ? m.media_type === 'tv'
            : m.media_type !== 'tv';
          return t === titleLower && (!year || y === year) && typeOk;
        }) ||
        movies.find((m) => {
          const t = (m.title || m.name || '').toLowerCase();
          return t === titleLower && (preferTv ? m.media_type === 'tv' : true);
        }) ||
        movies[0];

      if (!match?.id) {
        toast.error('Could not find this title on TMDB.');
        return;
      }

      const mediaType =
        match.media_type === 'tv' || item.content_type === 'SERIES' ? 'tv' : 'movie';
      navigate(`/${mediaType}/${match.id}`);
    } catch (err) {
      console.error('franchise open title failed', err);
      toast.error('Failed to open title. Check your connection and try again.');
    } finally {
      setResolvingId(null);
    }
  };

  const notFound = isNotFoundError(error);
  const missingSlug = !slug?.trim();

  return (
    <div className="min-h-screen bg-background">
      <SEOMetadata
        title={franchise?.name || 'Franchise'}
        description={
          franchise?.description ||
          `Browse titles in the ${franchise?.name || ''} franchise.`
        }
        imageUrl={franchise?.titleImageUrl || titles[0]?.poster || undefined}
      />
      <Header
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="pb-28 md:pb-12">
        {/* Hero */}
        <div className="relative pt-16 mb-6 overflow-hidden">
          {heroBackdrop && !loading && franchise && (
            <>
              <div className="absolute inset-0 h-56 sm:h-64">
                <img
                  src={heroBackdrop}
                  alt=""
                  className="h-full w-full object-cover object-center opacity-40"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
              </div>
            </>
          )}

          <div className="relative container mx-auto px-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm"
              onClick={() => navigate('/franchises')}
            >
              <ArrowLeft className="h-4 w-4" />
              All franchises
            </Button>

            {loading && !franchise && (
              <div className="space-y-3 max-w-xl pb-4">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            )}

            {!loading && !isOptimistic && franchise && !isError && (
              <div className="max-w-2xl space-y-3 pb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  {franchise.name}
                </h1>
                {franchise.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {franchise.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                    {(titles.length || franchise.content_order?.length || 0)} title
                    {(titles.length || franchise.content_order?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  {movieCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <Clapperboard className="h-3 w-3" />
                      {movieCount} movie{movieCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {seriesCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <Tv className="h-3 w-3" />
                      {seriesCount} series
                    </span>
                  )}
                  {yearRange && (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {yearRange}
                    </span>
                  )}
                  {avgRating != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                      <Star className="h-3 w-3 text-primary fill-primary" />
                      {avgRating.toFixed(1)} avg
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4">
          {(loading || isOptimistic) && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          )}

          {(missingSlug || notFound) && !loading && (
            <div className="text-center py-20 space-y-3">
              <Layers className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <h1 className="text-xl font-semibold">Franchise not found</h1>
              <p className="text-sm text-muted-foreground">
                {missingSlug
                  ? 'This link is incomplete.'
                  : 'This franchise may have been removed or the link is invalid.'}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/franchises">Back to franchises</Link>
              </Button>
            </div>
          )}

          {isError && !notFound && !missingSlug && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Could not load this franchise</p>
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

          {!loading && !isOptimistic && franchise && !isError && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
                {titles.map((item, index) => (
                  <FranchiseTitleCard
                    key={item.content_id}
                    item={item}
                    index={index}
                    onOpen={handleOpen}
                    resolving={resolvingId === item.content_id}
                  />
                ))}
              </div>

              {titles.length === 0 && (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  No titles listed in this franchise yet.
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default FranchiseDetailPage;
