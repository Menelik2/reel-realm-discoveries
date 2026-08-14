import { useQuery } from '@tanstack/react-query';
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

export const useFranchises = () => {
  const query = useQuery({
    queryKey: ['franchises'],
    queryFn: fetchFranchises,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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
  const trimmed = (slug || '').trim();
  const query = useQuery({
    queryKey: ['franchise', trimmed],
    queryFn: () => fetchFranchise(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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
