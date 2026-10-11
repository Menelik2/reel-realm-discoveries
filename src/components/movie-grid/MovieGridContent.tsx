import type { ContentType } from '@/types/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import type { Movie } from '@/types/tmdb';
import { pageWindow, canGoPrev, canGoNext, clampPage } from '@/utils/pagination';
import { Search } from 'lucide-react';

interface MovieGridContentProps {
  movies: Movie[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onMovieClick: (movieId: number) => void;
  onPageChange: (page: number) => void;
  contentType: ContentType;
  searchQuery: string;
  currentCategory: string;
}

const CARD_GRID = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4';

export const MovieGridContent = ({
  movies,
  loading,
  currentPage,
  totalPages,
  onMovieClick,
  onPageChange,
  contentType,
  searchQuery,
  currentCategory,
}: MovieGridContentProps) => {
  if (loading) {
    return (
      <div className={CARD_GRID}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-secondary/80 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-border/50 bg-card/50">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold mb-1.5">
          {searchQuery
            ? `No results for “${searchQuery}”`
            : currentCategory === 'custom'
            ? 'Your list is empty'
            : `No ${contentType === 'movie' ? 'movies' : contentType === 'tv' ? 'series' : 'content'} found`}
        </p>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {searchQuery
            ? 'Try another spelling or a different title.'
            : currentCategory === 'custom'
            ? 'Add content from the admin page.'
            : 'Try adjusting your filters or category.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={CARD_GRID}>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (canGoPrev(currentPage)) onPageChange(clampPage(currentPage - 1, totalPages));
                  }}
                  className={`rounded-full ${!canGoPrev(currentPage) ? 'pointer-events-none opacity-50' : ''}`}
                  aria-disabled={!canGoPrev(currentPage)}
                />
              </PaginationItem>

              {pageWindow(currentPage, totalPages, 5).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(pageNum);
                    }}
                    isActive={pageNum === currentPage}
                    className="rounded-full"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (canGoNext(currentPage, totalPages)) {
                      onPageChange(clampPage(currentPage + 1, totalPages));
                    }
                  }}
                  className={`rounded-full ${!canGoNext(currentPage, totalPages) ? 'pointer-events-none opacity-50' : ''}`}
                  aria-disabled={!canGoNext(currentPage, totalPages)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="text-center mt-4 text-xs text-muted-foreground tabular-nums">
            Page {currentPage} of {totalPages}
            {' · '}
            {searchQuery
              ? 'search results'
              : contentType === 'movie'
                ? 'movies'
                : contentType === 'tv'
                  ? 'series'
                  : 'titles'}
          </div>
        </div>
      )}
    </>
  );
};
