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

  return {
    franchise: query.data,
    loading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/** Prefetch detail on hover for instant navigation */
export const usePrefetchFranchise = () => {
  const qc = useQueryClient();
  return useCallback(
    (slug: string) => {
      const s = slug.trim().toLowerCase();
      if (!s) return;
      void qc.prefetchQuery({
        queryKey: detailKey(s),
        queryFn: () => fetchFranchise(s),
        staleTime: 30 * 60 * 1000,
      });
    },
    [qc]
  );
};
