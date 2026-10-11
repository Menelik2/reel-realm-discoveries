import { Skeleton } from '@/components/ui/skeleton';

export const MovieDetailsSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <Skeleton className="h-56 sm:h-72 md:h-96 lg:h-[28rem] w-full rounded-none" />

      <div className="container mx-auto px-4 py-6 -mt-16 sm:-mt-20 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <Skeleton className="w-40 h-60 sm:w-48 sm:h-72 lg:w-56 lg:h-[21rem] rounded-2xl" />
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <Skeleton className="h-9 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-12 w-full rounded-2xl mt-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full mt-10 rounded-2xl" />
      </div>
    </div>
  );
};
