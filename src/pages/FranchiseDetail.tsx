import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Layers, Loader2, RefreshCw, Star } from 'lucide-react';
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

const yearOf = (date: string | null) => (date && date.length >= 4 ? date.slice(0, 4) : '');

const FranchiseTitleCard = ({
  item,
  onOpen,
  resolving,
}: {
  item: FranchiseContentItem;
  onOpen: (item: FranchiseContentItem) => void;
  resolving: boolean;
}) => {
  const year = yearOf(item.release_date);
  const rating = item.mean_rating;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      disabled={resolving}
      className="group relative rounded-lg overflow-hidden bg-card text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-300 hover:scale-[1.03] hover:shadow-[var(--card-shadow-hover)] disabled:opacity-70"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <div className="relative aspect-[2/3] overflow-hidden card-poster-host">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            decoding="async"
            width={342}
            height={513}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Layers className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        {resolving && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {rating != null && rating > 0 && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <Star className="h-2.5 w-2.5 text-primary fill-primary" />
            <span className="text-[10px] font-semibold text-foreground">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-1.5 md:p-2 space-y-0.5">
        <h3 className="font-semibold text-[11px] md:text-xs text-card-foreground line-clamp-2 leading-snug">
          {item.title}
        </h3>
        {year && <p className="text-[10px] text-muted-foreground">{year}</p>}
      </div>
    </button>
  );
};

const FranchiseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { franchise, loading, isError, error, refetch, isFetching } = useFranchise(slug);
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

  const handleOpen = async (item: FranchiseContentItem) => {
    if (!item.title?.trim()) {
      toast.error('This title has no name and cannot be opened.');
      return;
    }
    if (resolvingId != null) return;

    setResolvingId(item.content_id);
    try {
      const { movies } = await searchContent({ searchQuery: item.title, currentPage: 1 });
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
          return t === titleLower && (!year || y === year);
        }) ||
        movies.find((m) => (m.title || m.name || '').toLowerCase() === titleLower) ||
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

      <main className="container mx-auto px-4 pt-24 pb-28 md:pb-12">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/franchises')}
        >
          <ArrowLeft className="h-4 w-4" />
          All franchises
        </Button>

        {loading && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
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
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
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

        {!loading && franchise && !isError && (
          <>
            <div className="mb-8 space-y-2 max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{franchise.name}</h1>
              {franchise.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {franchise.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {titles.length} title{titles.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
              {titles.map((item) => (
                <FranchiseTitleCard
                  key={item.content_id}
                  item={item}
                  onOpen={handleOpen}
                  resolving={resolvingId === item.content_id}
                />
              ))}
            </div>

            {titles.length === 0 && (
              <p className="text-sm text-muted-foreground py-8">No titles listed yet.</p>
            )}
          </>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default FranchiseDetailPage;
