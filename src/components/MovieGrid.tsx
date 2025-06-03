
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MovieCard } from '@/components/MovieCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

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

// TMDB API credentials
const TMDB_API_KEY = '1177de48cd44943e60240337bac80877';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalMovies: 0,
    averageRating: 0,
    genreStats: {} as Record<string, { count: number; avgRating: number }>
  });

  useEffect(() => {
    setCurrentPage(1);
    fetchMovies(1);
  }, [currentCategory, selectedGenre, selectedYear]);

  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
      searchMovies(1);
    } else {
      setCurrentPage(1);
      fetchMovies(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery) {
      fetchMovies(currentPage);
    } else {
      searchMovies(currentPage);
    }
  }, [currentPage]);

  const fetchMovies = async (page: number) => {
    setLoading(true);
    try {
      let url = `${TMDB_BASE_URL}/movie/${currentCategory}?page=${page}`;
      
      if (selectedGenre !== 'all') {
        url += `&with_genres=${selectedGenre}`;
      }
      
      if (selectedYear !== 'all') {
        url += `&primary_release_year=${selectedYear}`;
      }

      console.log('Fetching movies from:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('TMDB Response:', data);
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 50)); // Limit to 50 pages (1000 movies)
      
      // Calculate statistics
      calculateStats(data.results || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (page: number) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(searchQuery)}&page=${page}`;
      console.log('Searching movies:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Search results:', data);
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 50));
      
      calculateStats(data.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (movieList: Movie[]) => {
    const totalMovies = movieList.length;
    const averageRating = movieList.reduce((sum, movie) => sum + movie.vote_average, 0) / totalMovies;
    
    const genreStats: Record<string, { count: number; avgRating: number; totalRating: number }> = {};
    
    movieList.forEach(movie => {
      movie.genre_ids?.forEach(genreId => {
        const genre = genres.find(g => g.id === genreId);
        if (genre) {
          if (!genreStats[genre.name]) {
            genreStats[genre.name] = { count: 0, avgRating: 0, totalRating: 0 };
          }
          genreStats[genre.name].count++;
          genreStats[genre.name].totalRating += movie.vote_average;
          genreStats[genre.name].avgRating = genreStats[genre.name].totalRating / genreStats[genre.name].count;
        }
      });
    });

    setStats({
      totalMovies,
      averageRating: Number(averageRating.toFixed(1)),
      genreStats: Object.fromEntries(
        Object.entries(genreStats).map(([key, value]) => [
          key, 
          { count: value.count, avgRating: Number(value.avgRating.toFixed(1)) }
        ])
      )
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      {/* Statistics Panel */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalMovies}</p>
            <p className="text-sm text-muted-foreground">Movies on this page</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.averageRating}/10</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{currentPage * 20}/1000+</p>
            <p className="text-sm text-muted-foreground">Movies Loaded</p>
          </div>
        </div>
        
        {Object.keys(stats.genreStats).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Genre Statistics:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.genreStats).map(([genre, stat]) => (
                <div key={genre} className="bg-background px-3 py-1 rounded-full text-sm">
                  {genre}: {stat.avgRating}/10 ({stat.count} movies)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
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
                          handlePageChange(pageNum);
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
                      handlePageChange(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} (Showing up to 1000 movies)
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No movies found. Try adjusting your filters or search query.</p>
        </div>
      )}
    </section>
  );
};
