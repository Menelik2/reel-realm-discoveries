import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchFranchises,
  fetchFranchise,
  FranchiseError,
  franchiseErrorMessage,
  isNotFoundError,
  type FranchiseSummary,
  type FranchiseDetail,
  type FranchiseContentItem,
} from '@/api/franchiseService';

export type {
  FranchiseSummary,
  FranchiseDetail,
  FranchiseContentItem,
  FranchiseError,
};
export { franchiseErrorMessage, isNotFoundError };

const LIST_KEY = ['franchises'] as const;
const detailKey = (slug: string) => ['franchise', slug] as const;

/** Build a partial detail payload from list row for instant detail paint */
export const summaryToOptimisticDetail = (summary: FranchiseSummary): FranchiseDetail => ({
  ...summary,
  content: [],
});

export const useFranchises = () => {
  const query = useQuery({
    queryKey: LIST_KEY,
    queryFn: fetchFranchises,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
    retry: (count, err) => {
      if (err instanceof FranchiseError && err.code === 'not_found') return false;
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
  const trimmed = (slug || '').trim().toLowerCase();
  const query = useQuery({
    queryKey: detailKey(trimmed),
    queryFn: () => fetchFranchise(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
    retry: (count, err) => {
      if (err instanceof FranchiseError && err.code === 'not_found') return false;
      return count < 2;
    },
  });

  const isOptimistic =
    !!query.data &&
    Array.isArray(query.data.content) &&
    query.data.content.length === 0 &&
    (query.isFetching || query.isLoading);

  return {
    franchise: query.data,
    loading: query.isLoading && !query.data,
    isOptimistic,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/** Initial worker count from network hints when available */
const initialConcurrency = (): number => {
  try {
    const conn = (navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }).connection;
    if (conn?.saveData) return 2;
    switch (conn?.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 2;
      case '3g':
        return 3;
      case '4g':
        return 6;
      default:
        return 4;
    }
  } catch {
    return 4;
  }
};

const MIN_CONCURRENCY = 2;
const MAX_CONCURRENCY = 8;

/**
 * Background-fetch full franchise details (all movies + series) for poster groups.
 * Adaptive concurrency, pauses when the tab is hidden, skips cached details.
 */
export const useFranchiseGroupPosters = (franchises: FranchiseSummary[]) => {
  const qc = useQueryClient();
  const [postersBySlug, setPostersBySlug] = useState<Record<string, string[]>>({});
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    if (!franchises.length) return;

    let cancelled = false;
    let concurrency = initialConcurrency();
    let active = 0;
    let nextIndex = 0;
    let consecutiveErrors = 0;
    let consecutiveOk = 0;

    const ordered = [...franchises].sort(
      (a, b) => (b.content_order?.length || 0) - (a.content_order?.length || 0)
    );

    // Apply posters from cache immediately; only queue uncached slugs
    const fromCache: Record<string, string[]> = {};
    const queue: FranchiseSummary[] = [];
    for (const f of ordered) {
      const slug = f.slug.toLowerCase();
      const cached = qc.getQueryData<FranchiseDetail>(detailKey(slug));
      if (cached?.content?.length) {
        const posters = cached.content
          .map((c) => c.poster)
          .filter((p): p is string => !!p)
          .slice(0, 4);
        if (posters.length) fromCache[slug] = posters;
      } else {
        queue.push(f);
      }
    }

    if (Object.keys(fromCache).length) {
      setPostersBySlug((prev) => ({ ...fromCache, ...prev }));
    }

    if (!queue.length) {
      setEnriching(false);
      return;
    }

    setEnriching(true);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const waitUntilVisible = async () => {
      if (typeof document === 'undefined') return;
      while (!cancelled && document.visibilityState === 'hidden') {
        await new Promise<void>((resolve) => {
          const handler = () => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', handler);
              resolve();
            }
          };
          document.addEventListener('visibilitychange', handler);
        });
      }
    };

    const applyPosters = (slug: string, detail: FranchiseDetail) => {
      const posters = detail.content
        .map((c) => c.poster)
        .filter((p): p is string => !!p)
        .slice(0, 4);
      if (!posters.length) return;
      setPostersBySlug((prev) => (prev[slug] ? prev : { ...prev, [slug]: posters }));
    };

    const fetchOne = async (item: FranchiseSummary) => {
      const slug = item.slug.toLowerCase();
      try {
        await waitUntilVisible();
        if (cancelled) return;

        const detail = await qc.fetchQuery({
          queryKey: detailKey(slug),
          queryFn: () => fetchFranchise(slug),
          staleTime: 30 * 60 * 1000,
        });

        if (cancelled || !detail) return;
        applyPosters(slug, detail);

        consecutiveOk += 1;
        consecutiveErrors = 0;
        if (consecutiveOk >= 4 && concurrency < MAX_CONCURRENCY) {
          concurrency += 1;
          consecutiveOk = 0;
        }
      } catch {
        consecutiveErrors += 1;
        consecutiveOk = 0;
        if (consecutiveErrors >= 2 && concurrency > MIN_CONCURRENCY) {
          concurrency = Math.max(MIN_CONCURRENCY, concurrency - 1);
          consecutiveErrors = 0;
        }
        await sleep(250);
      }
    };

    const pump = () => {
      while (!cancelled && active < concurrency && nextIndex < queue.length) {
        const item = queue[nextIndex++];
        active += 1;
        void fetchOne(item).finally(() => {
          active -= 1;
          if (cancelled) return;
          if (nextIndex < queue.length) {
            pump();
          } else if (active === 0) {
            setEnriching(false);
          }
        });
      }
      if (!cancelled && nextIndex >= queue.length && active === 0) {
        setEnriching(false);
      }
    };

    pump();

    const onVis = () => {
      if (document.visibilityState === 'visible' && !cancelled) pump();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [franchises, qc]);

  return { postersBySlug, enriching };
};

/**
 * Prefetch + optimistic seed:
 * - Writes list summary into detail cache immediately (instant header on navigate)
 * - Starts background fetch for full detail
 */
export const usePrefetchFranchise = () => {
  const qc = useQueryClient();

  const seedOptimistic = useCallback(
    (summary: FranchiseSummary) => {
      const slug = summary.slug.trim().toLowerCase();
      if (!slug) return;

      const key = detailKey(slug);
      const existing = qc.getQueryData<FranchiseDetail>(key);

      if (existing?.content && existing.content.length > 0) {
        return;
      }

      qc.setQueryData<FranchiseDetail>(key, (prev) => {
        if (prev?.content && prev.content.length > 0) return prev;
        return summaryToOptimisticDetail(summary);
      });
    },
    [qc]
  );

  const prefetch = useCallback(
    (slug: string, summary?: FranchiseSummary) => {
      const s = slug.trim().toLowerCase();
      if (!s) return;

      if (summary) {
        seedOptimistic(summary);
      } else {
        const list = qc.getQueryData<FranchiseSummary[]>(LIST_KEY);
        const row = list?.find((f) => f.slug.toLowerCase() === s);
        if (row) seedOptimistic(row);
      }

      void qc.prefetchQuery({
        queryKey: detailKey(s),
        queryFn: () => fetchFranchise(s),
        staleTime: 30 * 60 * 1000,
      });
    },
    [qc, seedOptimistic]
  );

  return { prefetch, seedOptimistic };
};
