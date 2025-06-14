import { AdBanner } from '@/components/AdBanner';
import { ContentTypeToggle } from '@/components/movie-grid/ContentTypeToggle';
import { CategoryTabs } from '@/components/movie-grid/CategoryTabs';
import { MovieFilters } from '@/components/movie-grid/MovieFilters';
import { MovieGridContent } from '@/components/movie-grid/MovieGridContent';
import type { Movie } from '@/hooks/useMovieData';

interface MovieGridProps {
  searchQuery: string;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  onMovieClick: (movieId: number) => void;
  contentType: 'movie' | 'tv';
  setContentType: (type: 'movie' | 'tv') => void;
  movies: Movie[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
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
  setCurrentCategory
}: MovieGridProps) => {
  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      {/* AdSense Banner */}
      <AdBanner 
        slot="1571190202"
        className="mb-6"
      />

      {!searchQuery ? (
        <>
          {/* Content Type Toggle */}
          <ContentTypeToggle 
            contentType={contentType}
            setContentType={setContentType}
          />

          {/* Category Tabs */}
          <div className="mb-6 md:mb-8">
            <CategoryTabs 
              currentCategory={currentCategory}
              setCurrentCategory={setCurrentCategory}
              contentType={contentType}
            />

            {/* Filters - only for popular and top_rated */}
            {(currentCategory === 'popular' || currentCategory === 'top_rated') && (
              <MovieFilters 
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
              />
            )}
          </div>
        </>
      ) : (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Search Results for "{searchQuery}"
          </h2>
        </div>
      )}

      {/* Content Grid */}
      <MovieGridContent 
        movies={movies}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onMovieClick={onMovieClick}
        onPageChange={handlePageChange}
        contentType={contentType}
        searchQuery={searchQuery}
      />
    </section>
  );
};
