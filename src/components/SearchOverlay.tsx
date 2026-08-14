import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  usePhonoSearch,
  matchedAlternativeTitle,
  type PhonoSearchResult,
} from '@/hooks/usePhonoSearch';
import { searchContent } from '@/api/tmdbService';

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const useDebounced = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const year = (date: string | null) => (date ? date.slice(0, 4) : null);

export const SearchOverlay = ({ open, onOpenChange }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [resolving, setResolving] = useState<string | null>(null);
  const debouncedQuery = useDebounced(query);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { groups, results, loading, isError } = usePhonoSearch(debouncedQuery);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery('');
      setResolving(null);
    }
  }, [open]);

  const isSearching = loading || (query !== debouncedQuery && query.trim().length >= 2);

  const totalCount = useMemo(() => results.length, [results]);

  const handleSelect = async (item: PhonoSearchResult) => {
    if (item.content_type === 'FRANCHISE') {
      onOpenChange(false);
      const slug =
        item.franchise_slug ||
        item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      navigate(`/franchise/${slug}`);
      return;
    }

    const id = String(item.content_id);
    setResolving(id);
    try {
      const { movies } = await searchContent({ searchQuery: item.title, currentPage: 1 });
      const wantedYear = year(item.release_date);
      const match =
        movies.find(
          m =>
            m.title?.toLowerCase() === item.title.toLowerCase() &&
            (!wantedYear || m.release_date?.startsWith(wantedYear))
        ) ||
        movies.find(m => m.title?.toLowerCase() === item.title.toLowerCase()) ||
        movies[0];

      onOpenChange(false);

      if (match) {
        const type = match.media_type === 'tv' ? 'tv' : 'movie';
        navigate(`/${type}/${match.id}`);
      } else {
        navigate(`/?search=${encodeURIComponent(item.title)}`);
      }
    } catch {
      toast.error('Could not open that title. Try again.');
    } finally {
      setResolving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden top-[8%] translate-y-0">
        <DialogTitle className="sr-only">Search movies, series and more</DialogTitle>

        <div className="flex items-center gap-2 border-b border-border/60 px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search titles, including alternative names…"
            className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && !isSearching && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          {query.trim().length < 2 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </p>
          )}

          {query.trim().length >= 2 && !isSearching && isError && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Search is unavailable right now. Please try again.
            </p>
          )}

          {query.trim().length >= 2 && !isSearching && !isError && totalCount === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No results for “{debouncedQuery}”.
            </p>
          )}

          {groups.map(group => (
            <section key={group.key} aria-label={group.label}>
              <h3 className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
                <span className="ml-2 font-normal normal-case tracking-normal opacity-70">
                  {group.items.length}
                </span>
              </h3>

              <ul>
                {group.items.map(item => {
                  const altMatch = matchedAlternativeTitle(item, debouncedQuery);
                  const id = String(item.content_id);
                  return (
                    <li key={`${group.key}-${id}`}>
                      <button
                        onClick={() => handleSelect(item)}
                        disabled={resolving === id}
                        className="w-full flex gap-3 px-4 py-2.5 text-left hover:bg-accent/60 transition-colors disabled:opacity-60"
                      >
                        <div className="w-10 h-[60px] shrink-0 rounded-md overflow-hidden bg-muted">
                          {item.poster && (
                            <img
                              src={item.poster}
                              alt={`${item.title} poster`}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-sm">{item.title}</span>
                            {year(item.release_date) && (
                              <span className="text-xs text-muted-foreground shrink-0">
                                {year(item.release_date)}
                              </span>
                            )}
                            {resolving === id && (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            )}
                          </div>

                          {altMatch && (
                            <p className="truncate text-xs text-primary">
                              Also known as: {altMatch}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {typeof item.mean_rating === 'number' && item.mean_rating > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current text-primary" />
                                {item.mean_rating.toFixed(1)}
                              </span>
                            )}
                            {item.genres?.length > 0 && (
                              <span className="truncate">{item.genres.slice(0, 3).join(' • ')}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
