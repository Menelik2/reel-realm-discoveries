import { useQuery } from '@tanstack/react-query';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/phono-franchise`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface FranchiseSummary {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  titleImageUrl: string | null;
  keywords: string[] | null;
  createdAt: string;
  updatedAt: string;
  content_order: number[];
}

export interface FranchiseContentItem {
  content_id: number;
  content_type: 'MOVIE' | 'SERIES' | 'ASIAN' | string;
  asian_type: string | null;
  title: string;
  poster: string | null;
  backdrop: string | null;
  release_date: string | null;
  mean_rating: number | null;
  runtime_minutes: number | null;
  plot_summary: string | null;
  total_number_of_votes: number | null;
  parental_rating: string | null;
  languages: { language_id: number; title: string }[];
  genres: string[];
  is_anime: boolean;
  is_asian: boolean;
  blurhash?: string | null;
}

export interface FranchiseDetail extends FranchiseSummary {
  content: FranchiseContentItem[];
}

async function fetchFranchises(): Promise<FranchiseSummary[]> {
  const res = await fetch(FUNCTIONS_URL, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`franchises failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('invalid franchises payload');
  return data as FranchiseSummary[];
}

async function fetchFranchise(slug: string): Promise<FranchiseDetail> {
  const res = await fetch(`${FUNCTIONS_URL}?slug=${encodeURIComponent(slug)}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (res.status === 404) throw new Error('not_found');
  if (!res.ok) throw new Error(`franchise failed: ${res.status}`);
  return (await res.json()) as FranchiseDetail;
}

export const useFranchises = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['franchises'],
    queryFn: fetchFranchises,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  return {
    franchises: data || [],
    loading: isLoading,
    isError,
    error,
  };
};

export const useFranchise = (slug: string | undefined) => {
  const trimmed = (slug || '').trim();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['franchise', trimmed],
    queryFn: () => fetchFranchise(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: (count, err) => {
      if (err instanceof Error && err.message === 'not_found') return false;
      return count < 1;
    },
  });

  return {
    franchise: data,
    loading: isLoading,
    isError,
    error,
  };
};
