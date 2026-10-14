import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
import { cn } from '@/lib/utils';

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Seed the overlay input when opened from the header search field */
  initialQuery?: string;
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

/** Prefer TV when phono says SERIES/ASIAN series-like; otherwise movie. */
const preferredMediaType = (item: PhonoSearchResult): 'movie' | 'tv' | undefined => {
  const t = (item.content_type || '').toUpperCase();
  if (t === 'SERIES' || t === 'TV') return 'tv';
  if (t === 'MOVIE') return 'movie';
  return undefined;
};

export const SearchOverlay = ({ open, onOpenChange, initialQuery = '' }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [resolving, setResolving] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounced(query);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { groups, results, loading, isError } = usePhonoSearch(debouncedQuery);

  useEffect(() => {
    if (open) {
      // Seed from header if provided; otherwise keep empty for a fresh search
      if (initialQuery.trim()) setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResolving(null);
      setActiveIndex(-1);
    }
  }, [open, initialQuery]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  const isSearching = loading || (query !== debouncedQuery && query.trim().length >= 2);
  const totalCount = useMemo(() => results.length, [results]);

  const flatItems = useMemo(() => results, [results]);

  const handleSelect = useCallback(async (item: PhonoSearchResult) => {
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
      const prefer = preferredMediaType(item);
      // Hint TMDB search toward the right media type when we know it
      const { movies } = await searchContent({
        searchQuery: item.title,
        currentPage: 1,
        contentType: prefer,
      });

      const wantedYear = year(item.release_date);
      const titleLower = item.title.toLowerCase();

      const score = (m: (typeof movies)[0]) => {
        let s = 0;
        const mt = m.media_type === 'tv' ? 'tv' : 'movie';
        if (prefer && mt === prefer) s += 10;
        if (m.title?.toLowerCase() === titleLower) s += 5;
        else if (m.title?.toLowerCase().includes(titleLower) || titleLower.includes((m.title || '').toLowerCase())) s += 2;
        if (wantedYear && m.release_date?.startsWith(wantedYear)) s += 3;
        return s;
      };

      const ranked = [...movies].sort((a, b) => score(b) - score(a));
      const match = ranked[0];

      onOpenChange(false);

      if (match) {
        const type =
          match.media_type === 'tv' || prefer === 'tv'
            ? 'tv'
            : 'movie';
        // If we preferred TV but multi returned a movie first, still honor prefer when scores are close
        const finalType =
          prefer === 'tv' && match.media_type !== 'tv' && ranked.some(m => m.media_type === 'tv' && score(m) >= score(match) - 2)
            ? 'tv'
            : type;
        const finalMatch =
          finalType === 'tv' && match.media_type !== 'tv'
            ? ranked.find(m => m.media_type === 'tv') || match
            : match;
        navigate(`/${finalType}/${finalMatch.id}`);
      } else {
        navigate(`/?search=${encodeURIComponent(item.title)}`);
      }
    } catch {
      toast.error('Could not open that title. Try again.');
    } finally {
      setResolving(null);
    }
  }, [navigate, onOpenChange]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < flatItems.length) {
      e.preventDefault();
      handleSelect(flatItems[activeIndex]);
    } else if (e.key === 'Enter' && query.trim().length >= 2 && flatItems.length === 0 && !isSearching) {
      // Fallback: page-level TMDB search when phono has no hits
      e.preventDefault();
      onOpenChange(false);
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(flatItems.length - 1);
    }
  };

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-result-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  let runningIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden top-[6%] sm:top-[8%] translate-y-0 rounded-2xl border-border/50 shadow-2xl"
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">Search movies, series and more</DialogTitle>

        <div className="flex items-center gap-3 border-b border-border/50 px-4 bg-background/95">
          <Search className="shrink-0 text-muted-foreground" style={{ width: 18, height: 18 }} aria-hidden="true" />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search titles, including alternative names…"
            className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-0 font-medium"
            role="combobox"
            aria-expanded={totalCount > 0}
            aria-controls="search-results-list"
            aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
          />
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" aria-label="Searching" />
          )}
          {query && !isSearching && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors pressable"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          ref={listRef}
          id="search-results-list"
          role="listbox"
          aria-label="Search results"
          className="max-h-[65vh] overflow-y-auto"
        >
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {query.trim().length >= 2 && !isSearching && !isError
              ? totalCount === 0
                ? `No results for ${debouncedQuery}`
                : `${totalCount} result${totalCount === 1 ? '' : 's'}`
              : ''}
          </div>

          {query.trim().length < 2 && (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try titles, alternative names, or franchises
              </p>
            </div>
          )}

          {query.trim().length >= 2 && !isSearching && isError && (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground" role="alert">
              Search is unavailable right now. Please try again.
            </p>
          )}

          {query.trim().length >= 2 && !isSearching && !isError && totalCount === 0 && (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              No results for “{debouncedQuery}”. Press Enter to search TMDB.
            </p>
          )}

          {groups.map(group => (
            <section key={group.key} aria-label={group.label}>
              <h3 className="sticky top-0 z-10 bg-background/95 backdrop-blur-md px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/30">
                {group.label}
                <span className="ml-2 font-normal normal-case tracking-normal opacity-70 tabular-nums">
                  {group.items.length}
                </span>
              </h3>

              <ul className="py-1" role="group" aria-label={group.label}>
                {group.items.map(item => {
                  runningIndex += 1;
                  const idx = runningIndex;
                  const altMatch = matchedAlternativeTitle(item, debouncedQuery);
                  const id = String(item.content_id);
                  const isActive = activeIndex === idx;

                  return (
                    <li key={`${group.key}-${id}`} role="presentation">
                      <button
                        type="button"
                        id={`search-option-${idx}`}
                        data-result-index={idx}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        disabled={resolving === id}
                        className={cn(
                          'w-full flex gap-3 px-4 py-2.5 text-left transition-colors disabled:opacity-60',
                          isActive ? 'bg-accent/70' : 'hover:bg-accent/50'
                        )}
                      >
                        <div className="w-11 h-[66px] shrink-0 rounded-lg overflow-hidden bg-secondary ring-1 ring-border/40">
                          {item.poster && (
                            <img
                              src={item.poster}
                              alt=""
                              loading="lazy"
                              width={44}
                              height={66}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 py-0.5">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-semibold text-sm">{item.title}</span>
                            {year(item.release_date) && (
                              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                                {year(item.release_date)}
                              </span>
                            )}
                            {resolving === id && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" aria-label="Opening" />
                            )}
                          </div>

                          {altMatch && (
                            <p className="truncate text-xs text-primary mt-0.5">
                              Also known as: {altMatch}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {typeof item.mean_rating === 'number' && item.mean_rating > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                                <span className="tabular-nums font-medium">{item.mean_rating.toFixed(1)}</span>
                              </span>
                            )}
                            {item.genres?.length > 0 && (
                              <span className="truncate opacity-80">{item.genres.slice(0, 3).join(' · ')}</span>
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
