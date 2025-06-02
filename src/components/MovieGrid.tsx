
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
  overview?: string;
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
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
];

const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

// TMDB API key - In production, this should be stored securely in backend
const TMDB_API_KEY = 'T1177de48cd44943e60240337bac80877';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
  }, [currentCategory, selectedGenre, selectedYear]);

  useEffect(() => {
    if (searchQuery) {
      searchMovies();
    } else {
      fetchMovies();
    }
  }, [searchQuery]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let url = `${TMDB_BASE_URL}/movie/${currentCategory}?api_key=${TMDB_API_KEY}&page=1`;
      
      // Add genre filter if selected
      if (selectedGenre !== 'all') {
        url += `&with_genres=${selectedGenre}`;
      }
      
      // Add year filter if selected
      if (selectedYear !== 'all') {
        url += `&primary_release_year=${selectedYear}`;
      }

      console.log('Fetching movies from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('TMDB Response:', data);
      setMovies(data.results || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1`;
      console.log('Searching movies:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Search results:', data);
      setMovies(data.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      {/* Category Tabs */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6">
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
              className="text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No movies found. Try adjusting your filters or search query.</p>
        </div>
      )}
    </section>
  );
};
