import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
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
