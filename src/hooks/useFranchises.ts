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
 * Background-load full franchise details (all movies + series) to power
 * poster group images on the list. Adaptive concurrency, pauses when tab hidden.
 * Prioritizes franchises with the most titles. Seeds detail cache for navigation.
 */
export const useFranchiseGroupPosters = (franchises: FranchiseSummary[]) => {
  const qc = useQueryClient();
  const [postersBySlug, setPostersBySlug] = useState<Record<string, string[]>>({});
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    if (!franchises.length) return;

    let cancelled = false;
    let concurrency = initialConcurrency();
    let inFlight = 0;
    let cursor = 0;
    let consecutiveErrors = 0;
    let consecutiveOk = 0;

    // Prefer largest franchises first so the default "Most titles" view fills in posters quickly
    const ordered = [...franchises].sort(
      (a, b) => (b.content_order?.length || 0) - (a.content_order?.length || 0)
    );

    // Skip slugs already fully cached
    const queue = ordered.filter((f) => {
      const slug = f.slug.toLowerCase();
      const cached = qc.getQueryData<FranchiseDetail>(detailKey(slug));
      if (cached?.content?.length) {
        const posters = cached.content
          .map((c) => c.poster)
          .filter((p): p is string => !!p)
          .slice(0, 4);
        if (posters.length) {
          setPostersBySlug((prev) => (prev[slug] ? prev : { ...prev, [slug]: posters }));
        }
        return false;
      }
      return true;
    });

    if (!queue.length) {
      setEnriching(false);
      return;
    }

    setEnriching(true);

    const waitIfHidden = async () => {
      while (!cancelled && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        await new Promise<void>((resolve) => {
          const onVis = () => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', onVis);
              resolve();
            }
          };
          document.addEventListener('visibilitychange', onVis);
        });
      }
    };

    const adjustConcurrency = (ok: boolean) => {
      if (ok) {
        consecutiveOk += 1;
        consecutiveErrors = 0;
        // Ramp up after a streak of successes
        if (consecutiveOk >= 4 && concurrency < MAX_CONCURRENCY) {
          concurrency += 1;
          consecutiveOk = 0;
        }
      } else {
        consecutiveErrors += 1;
        consecutiveOk = 0;
        if (consecutiveErrors >= 2 && concurrency > MIN_CONCURRENCY) {
          concurrency = Math.max(MIN_CONCURRENCY, concurrency - 1);
          consecutiveErrors = 0;
        }
      }
    };

    const processOne = async (item: FranchiseSummary) => {
      const slug = item.slug.toLowerCase();
      try {
        await waitIfHidden();
        if (cancelled) return;

        let detail = qc.getQueryData<FranchiseDetail>(detailKey(slug));
        if (!detail?.content?.length) {
          detail = await qc.fetchQuery({
            queryKey: detailKey(slug),
            queryFn: () => fetchFranchise(slug),
            staleTime: 30 * 60 * 1000,
          });
        }

        if (cancelled || !detail) return;

        const posters = detail.content
          .map((c) => c.poster)
          .filter((p): p is string => !!p)
          .slice(0, 4);

        if (posters.length) {
          setPostersBySlug((prev) => (prev[slug] ? prev : { ...prev, [slug]: posters }));
        }
        adjustConcurrency(true);
      } catch {
        adjustConcurrency(false);
        // Brief backoff on error / rate limit pressure
        await new Promise((r) => setTimeout(r, 200 + consecutiveErrors * 150));
      }
    };

    const pump = async () => {
      while (!cancelled && cursor < queue.length) {
        await waitIfHidden();
        if (cancelled) break;

        while (!cancelled && inFlight < concurrency && cursor < queue.length) {
          const item = queue[cursor++];
          inFlight += 1;
          void processOne(item).finally(() => {
            inFlight -= 1;
            // Continue draining when a slot frees
            if (!cancelled && cursor < queue.length) {
              void pump();
            } else if (!cancelled && inFlight === 0 && cursor >= queue.length) {
              setEnriching(false);
            }
          });
        }
        // Avoid tight loop when workers are saturated
        if (inFlight >= concurrency) break;
      }
      if (!cancelled && inFlight === 0 && cursor >= queue.length) {
        setEnriching(false);
      }
    };

    void pump();

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        void pump();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
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
