
import { MovieCard } from '@/components/MovieCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AdBanner } from '@/components/AdBanner';
import type { Movie } from '@/types/tmdb';

interface MovieGridContentProps {
  movies: Movie[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onMovieClick: (movieId: number) => void;
  onPageChange: (page: number) => void;
  contentType: 'movie' | 'tv';
  searchQuery: string;
  currentCategory: string;
}

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
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
            : `No ${contentType === 'movie' ? 'movies' : 'series'} found. Try adjusting your filters.`}
        </p>
        <p className="text-muted-foreground text-sm">
          Try another search or change category.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
        ))}
      </div>
      
      {/* AdSense Banner between content and pagination */}
      <div className="my-8">
        <AdBanner slot="1571190202" />
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
                    onPageChange(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
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
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} (Showing up to 2000 {!!searchQuery ? 'results' : (contentType === 'movie' ? 'movies' : 'series')})
          </div>
        </div>
      )}
    </>
  );
};
