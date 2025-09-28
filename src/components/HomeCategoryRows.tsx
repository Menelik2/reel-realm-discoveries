import { useState } from 'react';
import { useMovieData } from '@/hooks/useMovieData';
import { MovieCard } from '@/components/MovieCard';
import { AdBanner } from '@/components/AdBanner';
import { ContentTypeToggle } from '@/components/movie-grid/ContentTypeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Movie } from '@/types/tmdb';

interface HomeCategoryRowsProps {
  contentType: 'movie' | 'tv';
  setContentType: (type: 'movie' | 'tv') => void;
  onMovieClick: (movieId: number) => void;
}

const genres = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
];

export const HomeCategoryRows = ({ contentType, setContentType, onMovieClick }: HomeCategoryRowsProps) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  
  const categories = [
    { key: 'trending_week', label: 'Trending This Week' },
    { key: 'popular', label: 'Popular' },
    { key: 'top_rated', label: 'Top Rated' },
    { key: 'upcoming', label: contentType === 'movie' ? 'Upcoming' : 'On The Air' },
    { key: 'now_playing', label: contentType === 'movie' ? 'Now Playing' : 'Airing Today' },
    { key: 'latest_releases', label: 'Latest Releases' }
  ];

  return (
    <div className="space-y-8">
      {/* Content Type Toggle & Genre Filter */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <ContentTypeToggle 
            contentType={contentType}
            setContentType={setContentType}
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by Genre:</span>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre.id} value={genre.id.toString()}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
          selectedGenre={selectedGenre}
          onMovieClick={onMovieClick}
          showAdAfter={index === 1} // Show ad after second category
          sectionIndex={index}
        />
      ))}
    </div>
  );
};

interface CategorySectionProps {
  category: { key: string; label: string };
  contentType: 'movie' | 'tv';
  selectedGenre: string;
  onMovieClick: (movieId: number) => void;
  showAdAfter?: boolean;
  sectionIndex: number;
}

const CategorySection = ({ category, contentType, selectedGenre, onMovieClick, showAdAfter, sectionIndex }: CategorySectionProps) => {
  const { movies, loading } = useMovieData({
    searchQuery: '',
    selectedGenre,
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
            <AdBanner slot={`892642019${sectionIndex}`} className="my-6" />
          </div>
        )}
      </>
    );
  }

  if (movies.length === 0) {
    return showAdAfter ? (
      <div className="container mx-auto px-4">
        <AdBanner slot={`892642019${sectionIndex}`} className="my-6" />
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
          <AdBanner slot={`892642019${sectionIndex}`} className="my-6" />
        </div>
      )}
    </>
  );
};