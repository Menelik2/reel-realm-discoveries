import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UsersRound, Search, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const TMDB_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';

interface PersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  known_for?: Array<{ title?: string; name?: string; media_type?: string }>;
}

interface ActorSearchProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export const ActorSearch = ({ variant = 'icon', className = '' }: ActorSearchProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(q)}&include_adult=false&page=1`,
          {
            signal: ctrl.signal,
            headers: {
              Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults((data.results || []).slice(0, 12));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Search failed. Try again.');
        setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  const handleSelect = (id: number) => {
    setOpen(false);
    navigate(`/person/${id}`);
  };

  const trigger =
    variant === 'full' ? (
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 rounded-full ${className}`}
      >
        <UsersRound className="h-4 w-4" />
        Search actors
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full ${className}`}
        aria-label="Search actors"
      >
        <UsersRound className="h-4 w-4" />
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base">Search actors & crew</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Cillian Murphy, David Fincher…"
              className="pl-9 pr-9 h-10 rounded-full"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto border-t border-border/60">
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!loading && error && (
            <p className="p-6 text-sm text-destructive text-center">{error}</p>
          )}
          {!loading && !error && query.trim() && results.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground text-center">
              No people found for "{query.trim()}".
            </p>
          )}
          {!loading && !query.trim() && (
            <p className="p-6 text-sm text-muted-foreground text-center">
              Start typing to search people from TMDB.
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((p) => {
                const knownFor = (p.known_for || [])
                  .map((k) => k.title || k.name)
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(' · ');
                return (
                  <li key={p.id}>
                    <Link
                      to={`/person/${p.id}`}
                      onClick={() => handleSelect(p.id)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"
                    >
                      <img
                        src={
                          p.profile_path
                            ? `https://image.tmdb.org/t/p/w92${p.profile_path}`
                            : '/placeholder.svg'
                        }
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                        }}
                        alt={p.name}
                        className="h-12 w-12 rounded-full object-cover bg-muted flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.known_for_department || 'Person'}
                          {knownFor ? ` — ${knownFor}` : ''}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
