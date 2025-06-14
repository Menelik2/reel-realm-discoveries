import { Skeleton } from '@/components/ui/skeleton';

export const MovieDetailsSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Header Skeleton */}
      <Skeleton className="h-64 md:h-80 lg:h-96 w-full" />

      <div className="container mx-auto px-4 py-6 -mt-20 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Poster Skeleton */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <Skeleton className="w-40 h-60 sm:w-48 sm:h-72 lg:w-56 lg:h-84 rounded-lg" />
          </div>
          {/* Info Skeleton */}
          <div className="flex-1 min-w-0">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Other sections skeleton */}
        <Skeleton className="h-40 w-full mt-8 rounded-lg" />
        <Skeleton className="h-64 w-full mt-8 rounded-lg" />
      </div>
    </div>
  );
};
