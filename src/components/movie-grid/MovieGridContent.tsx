import type { ContentType } from '@/types/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import type { Movie } from '@/types/tmdb';
import { pageWindow, canGoPrev, canGoNext, clampPage } from '@/utils/pagination';

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

const CARD_GRID = 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3';

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
          <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <p className="text-muted-foreground text-lg font-semibold mb-2">
          {searchQuery
            ? `No results found for "${searchQuery}".`
            : currentCategory === 'custom'
            ? 'Your list is empty. Add new content from the admin page.'
            : `No ${contentType === 'movie' ? 'movies' : contentType === 'tv' ? 'series' : 'content'} found. Try adjusting your filters.`}
        </p>
        <p className="text-muted-foreground text-sm">
          Try another search or change category.
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (canGoPrev(currentPage)) onPageChange(clampPage(currentPage - 1, totalPages));
                  }}
                  className={!canGoPrev(currentPage) ? 'pointer-events-none opacity-50' : ''}
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
                  className={!canGoNext(currentPage, totalPages) ? 'pointer-events-none opacity-50' : ''}
                  aria-disabled={!canGoNext(currentPage, totalPages)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
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
