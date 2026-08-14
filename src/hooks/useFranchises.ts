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

/**
 * Background-load full franchise details (all movies + series) to power
 * poster group images on the list. Prioritizes franchises with the most titles.
 * Also seeds the react-query detail cache for instant navigation.
 */
export const useFranchiseGroupPosters = (franchises: FranchiseSummary[]) => {
  const qc = useQueryClient();
  const [postersBySlug, setPostersBySlug] = useState<Record<string, string[]>>({});
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    if (!franchises.length) return;

    let cancelled = false;
    const CONCURRENCY = 5;

    // Prefer largest franchises first so the default "Most titles" view fills in posters quickly
    const ordered = [...franchises].sort(
      (a, b) => (b.content_order?.length || 0) - (a.content_order?.length || 0)
    );

    setEnriching(true);

    const run = async () => {
      let index = 0;

      const worker = async () => {
        while (!cancelled && index < ordered.length) {
          const current = ordered[index++];
          const slug = current.slug.toLowerCase();

          try {
            // Reuse cache if we already have full detail
            let detail = qc.getQueryData<FranchiseDetail>(detailKey(slug));
            if (!detail?.content?.length) {
              detail = await qc.fetchQuery({
                queryKey: detailKey(slug),
                queryFn: () => fetchFranchise(slug),
                staleTime: 30 * 60 * 1000,
              });
            }

            if (cancelled || !detail) continue;

            const posters = detail.content
              .map((c) => c.poster)
              .filter((p): p is string => !!p)
              .slice(0, 4);

            if (posters.length) {
              setPostersBySlug((prev) =>
                prev[slug] ? prev : { ...prev, [slug]: posters }
              );
            }
          } catch {
            // Ignore individual failures; list still works without posters
          }
        }
      };

      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
      if (!cancelled) setEnriching(false);
    };

    void run();
    return () => {
      cancelled = true;
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
