import { useMovieData } from '@/hooks/useMovieData';
import { MovieCard } from '@/components/MovieCard';
import { AdBanner } from '@/components/AdBanner';
import { ContentTypeToggle } from '@/components/movie-grid/ContentTypeToggle';
import type { Movie } from '@/types/tmdb';

interface HomeCategoryRowsProps {
  contentType: 'movie' | 'tv';
  setContentType: (type: 'movie' | 'tv') => void;
  onMovieClick: (movieId: number) => void;
}

export const HomeCategoryRows = ({ contentType, setContentType, onMovieClick }: HomeCategoryRowsProps) => {
  const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'top_rated', label: 'Top Rated' },
    { key: 'upcoming', label: contentType === 'movie' ? 'Upcoming' : 'On The Air' },
    { key: 'now_playing', label: contentType === 'movie' ? 'Now Playing' : 'Airing Today' }
  ];

  return (
    <div className="space-y-8">
      {/* Content Type Toggle */}
      <div className="container mx-auto px-4 pt-6">
        <ContentTypeToggle 
          contentType={contentType}
          setContentType={setContentType}
        />
      </div>

      {/* Ad Banner */}
      <div className="container mx-auto px-4">
        <AdBanner slot="1571190202" />
      </div>

      {categories.map((category, index) => (
        <CategorySection 
          key={category.key}
          category={category}
          contentType={contentType}
          onMovieClick={onMovieClick}
          showAdAfter={index === 1} // Show ad after second category
        />
      ))}
    </div>
  );
};

interface CategorySectionProps {
  category: { key: string; label: string };
  contentType: 'movie' | 'tv';
  onMovieClick: (movieId: number) => void;
  showAdAfter?: boolean;
}

const CategorySection = ({ category, contentType, onMovieClick, showAdAfter }: CategorySectionProps) => {
  const { movies, loading } = useMovieData({
    searchQuery: '',
    selectedGenre: 'all',
    selectedYear: 'all',
    contentType,
    currentCategory: category.key,
    currentPage: 1,
    enabled: true,
  });

  if (loading) {
    return (
      <>
        <section className="py-6 md:py-8 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">{category.label}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </section>
        {showAdAfter && (
          <div className="container mx-auto px-4">
            <AdBanner slot="8926420198" className="my-6" />
          </div>
        )}
      </>
    );
  }

  if (movies.length === 0) {
    return showAdAfter ? (
      <div className="container mx-auto px-4">
        <AdBanner slot="8926420198" className="my-6" />
      </div>
    ) : null;
  }

  return (
    <>
      <section className="py-6 md:py-8 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">{category.label}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {movies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onMovieClick={onMovieClick} 
            />
          ))}
        </div>
      </section>
      {showAdAfter && (
        <div className="container mx-auto px-4">
          <AdBanner slot="8926420198" className="my-6" />
        </div>
      )}
    </>
  );
};