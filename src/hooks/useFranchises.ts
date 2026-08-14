import { useQuery } from '@tanstack/react-query';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/phono-franchise`;
const ANON_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || '';

export type FranchiseErrorCode =
  | 'config'
  | 'network'
  | 'timeout'
  | 'not_found'
  | 'invalid_payload'
  | 'upstream'
  | 'unknown';

export class FranchiseError extends Error {
  code: FranchiseErrorCode;
  status?: number;

  constructor(code: FranchiseErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'FranchiseError';
    this.code = code;
    this.status = status;
  }
}

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

const assertConfig = () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !ANON_KEY) {
    throw new FranchiseError(
      'config',
      'Franchise service is not configured. Missing Supabase environment variables.'
    );
  }
};

const parseJsonSafe = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new FranchiseError(
      'invalid_payload',
      'Received an invalid response from the franchise service.',
      res.status
    );
  }
};

const mapHttpError = (status: number, body: unknown): FranchiseError => {
  const errField =
    body && typeof body === 'object' && 'error' in body
      ? String((body as { error?: string }).error || '')
      : '';

  if (status === 404 || errField === 'not_found') {
    return new FranchiseError('not_found', 'Franchise not found.', 404);
  }
  if (status === 502 || errField === 'upstream_error') {
    return new FranchiseError(
      'upstream',
      'Franchise provider is temporarily unavailable. Please try again.',
      status
    );
  }
  if (status >= 500) {
    return new FranchiseError(
      'upstream',
      'Franchise service error. Please try again later.',
      status
    );
  }
  return new FranchiseError(
    'unknown',
    `Could not load franchises (HTTP ${status}).`,
    status
  );
};

const fetchWithTimeout = async (url: string, init: RequestInit, ms = 12000): Promise<Response> => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new FranchiseError('timeout', 'Request timed out. Check your connection and try again.');
    }
    throw new FranchiseError(
      'network',
      'Network error while loading franchises. Check your connection.'
    );
  } finally {
    window.clearTimeout(timer);
  }
};

const isFranchiseSummary = (value: unknown): value is FranchiseSummary => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    typeof v.name === 'string' &&
    typeof v.slug === 'string'
  );
};

const normalizeSummary = (raw: FranchiseSummary): FranchiseSummary => ({
  ...raw,
  description: raw.description ?? null,
  titleImageUrl: raw.titleImageUrl ?? null,
  keywords: Array.isArray(raw.keywords) ? raw.keywords : null,
  content_order: Array.isArray(raw.content_order) ? raw.content_order : [],
});

const normalizeContentItem = (raw: unknown): FranchiseContentItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Record<string, unknown>;
  if (typeof v.content_id !== 'number' || typeof v.title !== 'string') return null;
  return {
    content_id: v.content_id,
    content_type: typeof v.content_type === 'string' ? v.content_type : 'MOVIE',
    asian_type: (v.asian_type as string | null) ?? null,
    title: v.title,
    poster: (v.poster as string | null) ?? null,
    backdrop: (v.backdrop as string | null) ?? null,
    release_date: (v.release_date as string | null) ?? null,
    mean_rating: typeof v.mean_rating === 'number' ? v.mean_rating : null,
    runtime_minutes: typeof v.runtime_minutes === 'number' ? v.runtime_minutes : null,
    plot_summary: (v.plot_summary as string | null) ?? null,
    total_number_of_votes:
      typeof v.total_number_of_votes === 'number' ? v.total_number_of_votes : null,
    parental_rating: (v.parental_rating as string | null) ?? null,
    languages: Array.isArray(v.languages) ? (v.languages as FranchiseContentItem['languages']) : [],
    genres: Array.isArray(v.genres) ? (v.genres as string[]) : [],
    is_anime: Boolean(v.is_anime),
    is_asian: Boolean(v.is_asian),
    blurhash: (v.blurhash as string | null) ?? null,
  };
};

async function fetchFranchises(): Promise<FranchiseSummary[]> {
  assertConfig();

  const res = await fetchWithTimeout(FUNCTIONS_URL, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });

  const body = await parseJsonSafe(res);
  if (!res.ok) throw mapHttpError(res.status, body);

  if (!Array.isArray(body)) {
    throw new FranchiseError('invalid_payload', 'Invalid franchises list from server.');
  }

  const list = body.filter(isFranchiseSummary).map(normalizeSummary);
  if (list.length === 0 && body.length > 0) {
    throw new FranchiseError('invalid_payload', 'Franchise list could not be parsed.');
  }
  return list;
}

async function fetchFranchise(slug: string): Promise<FranchiseDetail> {
  assertConfig();

  const cleaned = slug.trim().toLowerCase();
  if (!cleaned || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned)) {
    throw new FranchiseError('not_found', 'Invalid franchise link.', 404);
  }

  const res = await fetchWithTimeout(
    `${FUNCTIONS_URL}?slug=${encodeURIComponent(cleaned)}`,
    {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    }
  );

  const body = await parseJsonSafe(res);
  if (!res.ok) throw mapHttpError(res.status, body);

  if (!isFranchiseSummary(body)) {
    throw new FranchiseError('invalid_payload', 'Invalid franchise data from server.');
  }

  const rawContent =
    body && typeof body === 'object' && Array.isArray((body as { content?: unknown }).content)
      ? ((body as { content: unknown[] }).content)
      : [];

  const content = rawContent
    .map(normalizeContentItem)
    .filter((c): c is FranchiseContentItem => c !== null);

  return {
    ...normalizeSummary(body),
    content,
  };
}

export const franchiseErrorMessage = (error: unknown): string => {
  if (error instanceof FranchiseError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

export const isNotFoundError = (error: unknown): boolean =>
  error instanceof FranchiseError
    ? error.code === 'not_found'
    : error instanceof Error && error.message === 'not_found';

export const useFranchises = () => {
  const query = useQuery({
    queryKey: ['franchises'],
    queryFn: fetchFranchises,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: (count, err) => {
      if (err instanceof FranchiseError && (err.code === 'config' || err.code === 'not_found')) {
        return false;
      }
      return count < 2;
    },
  });

  return {
    franchises: query.data || [],
    loading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

export const useFranchise = (slug: string | undefined) => {
  const trimmed = (slug || '').trim();
  const query = useQuery({
    queryKey: ['franchise', trimmed],
    queryFn: () => fetchFranchise(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: (count, err) => {
      if (err instanceof FranchiseError && (err.code === 'not_found' || err.code === 'config')) {
        return false;
      }
      return count < 2;
    },
  });

  return {
    franchise: query.data,
    loading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};
