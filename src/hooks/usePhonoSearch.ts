import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PhonoSearchResult {
  content_id: string | number;
  content_type: 'MOVIE' | 'SERIES' | 'ASIAN' | 'FRANCHISE' | string;
  title: string;
  poster: string | null;
  posters?: string[];
  release_date: string | null;
  mean_rating: number | null;
  total_number_of_votes: number | null;
  runtime_minutes: number | null;
  genres: string[];
  plot_summary: string;
  alternative_titles: string[];
  is_anime: boolean;
  is_asian: boolean;
  franchise_slug?: string | null;
}

export interface PhonoSearchGroup {
  key: string;
  label: string;
  items: PhonoSearchResult[];
}

const GROUP_ORDER: { key: string; label: string; match: (r: PhonoSearchResult) => boolean }[] = [
  { key: 'movie', label: 'Movies', match: (r) => r.content_type === 'MOVIE' && !r.is_anime && !r.is_asian },
  { key: 'series', label: 'TV Series', match: (r) => r.content_type === 'SERIES' && !r.is_anime && !r.is_asian },
  { key: 'anime', label: 'Anime', match: (r) => r.is_anime },
  { key: 'asian', label: 'Asian', match: (r) => r.content_type === 'ASIAN' || (r.is_asian && !r.is_anime) },
  { key: 'franchise', label: 'Franchises', match: (r) => r.content_type === 'FRANCHISE' },
];

/** Alternative title that matched the query, if the main title didn't. */
export const matchedAlternativeTitle = (result: PhonoSearchResult, query: string): string | null => {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  if (result.title?.toLowerCase().includes(q)) return null;
  return (result.alternative_titles || []).find(t => t.toLowerCase().includes(q)) || null;
};

export const groupResults = (results: PhonoSearchResult[]): PhonoSearchGroup[] => {
  const used = new Set<PhonoSearchResult>();
  const groups: PhonoSearchGroup[] = [];

  for (const group of GROUP_ORDER) {
    const items = results.filter(r => !used.has(r) && group.match(r));
    items.forEach(i => used.add(i));
    if (items.length) groups.push({ key: group.key, label: group.label, items });
  }

  const rest = results.filter(r => !used.has(r));
  if (rest.length) groups.push({ key: 'other', label: 'Other', items: rest });

  return groups;
};

export const usePhonoSearch = (query: string) => {
  const trimmed = query.trim();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['phono-search', trimmed],
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PhonoSearchResult[]> => {
      const { data, error } = await supabase.functions.invoke('phono-search', {
        method: 'GET' as const,
        body: undefined,
        // query params are appended to the function URL
        ...({ } as Record<string, never>),
      });
      if (error) throw error;
      return (data as { results?: PhonoSearchResult[] })?.results || [];
    },
  });

  return {
    results: data || [],
    groups: groupResults(data || []),
    loading: isLoading,
    isError,
  };
};
