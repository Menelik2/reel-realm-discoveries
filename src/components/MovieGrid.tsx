
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MovieCard } from '@/components/MovieCard';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

interface MovieGridProps {
  searchQuery: string;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const genres = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

const years = ['2024', '2023', '2022', '2021', '2020', '2010s', '2000s', '1990s'];

export const MovieGrid = ({ 
  searchQuery, 
  selectedGenre, 
  setSelectedGenre, 
  selectedYear, 
  setSelectedYear 
}: MovieGridProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('popular');

  useEffect(() => {
    fetchMovies();
  }, [currentCategory, searchQuery, selectedGenre, selectedYear]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockMovies: Movie[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Movie ${i + 1}`,
        poster_path: `/placeholder-poster-${(i % 6) + 1}.jpg`,
        vote_average: 7.5 + Math.random() * 2,
        release_date: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
        genre_ids: [28, 35, 18][Math.floor(Math.random() * 3)] as any
      }));
      
      setMovies(mockMovies);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter(movie => {
    if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Category Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'popular', label: 'Popular' },
            { key: 'top_rated', label: 'Top Rated' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'now_playing', label: 'Now Playing' }
          ].map(category => (
            <Button
              key={category.key}
              variant={currentCategory === category.key ? 'default' : 'outline'}
              onClick={() => setCurrentCategory(category.key)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
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

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
};
