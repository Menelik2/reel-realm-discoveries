import type { ContentType } from '@/types/tmdb';

import { ContentTypeToggle } from '@/components/movie-grid/ContentTypeToggle';
import { CategoryTabs } from '@/components/movie-grid/CategoryTabs';
import { MovieFilters } from '@/components/movie-grid/MovieFilters';
import { MovieGridContent } from '@/components/movie-grid/MovieGridContent';
import type { Movie } from '@/types/tmdb';
import { Search } from 'lucide-react';

interface MovieGridProps {
  searchQuery: string;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  onMovieClick: (movieId: number) => void;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  movies: Movie[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  isMobile: boolean;
}

export const MovieGrid = ({
  searchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedYear,
  setSelectedYear,
  onMovieClick,
  contentType,
  setContentType,
  movies,
  loading,
  totalPages,
  currentPage,
  handlePageChange,
  currentCategory,
  setCurrentCategory,
  isMobile,
}: MovieGridProps) => {
  return (
    <section className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      {!searchQuery ? (
        currentCategory === 'custom' ? (
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-playfair font-bold tracking-tight">My List</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              A collection of your hand-picked movies and TV series.
            </p>
          </div>
        ) : (
          <>
            <ContentTypeToggle
              contentType={contentType}
              setContentType={setContentType}
            />

            <div className="mb-6 md:mb-8 mt-4">
              {!isMobile && (
                <CategoryTabs
                  currentCategory={currentCategory}
                  setCurrentCategory={setCurrentCategory}
                  contentType={contentType}
                />
              )}

              {(currentCategory === 'popular' || currentCategory === 'top_rated') && (
                <MovieFilters
                  selectedGenre={selectedGenre}
                  setSelectedGenre={setSelectedGenre}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  contentType={contentType}
                />
              )}
            </div>
          </>
        )
      ) : (
        <div className="mb-6 md:mb-8 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Search results
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Showing matches for “{searchQuery}”
            </p>
          </div>
        </div>
      )}

      <MovieGridContent
        movies={movies}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onMovieClick={onMovieClick}
        onPageChange={handlePageChange}
        contentType={contentType}
        searchQuery={searchQuery}
        currentCategory={currentCategory}
      />
    </section>
  );
};
