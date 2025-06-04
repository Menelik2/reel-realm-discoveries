
import { useState, useEffect } from 'react';
import { AdBanner } from '@/components/AdBanner';
import { ContentTypeToggle } from '@/components/movie-grid/ContentTypeToggle';
import { CategoryTabs } from '@/components/movie-grid/CategoryTabs';
import { MovieFilters } from '@/components/movie-grid/MovieFilters';
import { MovieGridContent } from '@/components/movie-grid/MovieGridContent';
import { useMovieData } from '@/hooks/useMovieData';

interface MovieGridProps {
  searchQuery: string;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  onMovieClick: (movieId: number) => void;
  contentType: 'movie' | 'tv';
  setContentType: (type: 'movie' | 'tv') => void;
}

export const MovieGrid = ({ 
  searchQuery, 
  selectedGenre, 
  setSelectedGenre, 
  selectedYear, 
  setSelectedYear,
  onMovieClick,
  contentType,
  setContentType
}: MovieGridProps) => {
  const [currentCategory, setCurrentCategory] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const { movies, loading, totalPages } = useMovieData({
    searchQuery,
    selectedGenre,
    selectedYear,
    contentType,
    currentCategory,
    currentPage
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, selectedGenre, selectedYear, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      {/* AdSense Banner */}
      <AdBanner 
        slot="5471985426"
        className="mb-6"
      />

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

        {/* Filters */}
        <MovieFilters 
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      </div>

      {/* Content Grid */}
      <MovieGridContent 
        movies={movies}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onMovieClick={onMovieClick}
        onPageChange={handlePageChange}
        contentType={contentType}
      />
    </section>
  );
};
