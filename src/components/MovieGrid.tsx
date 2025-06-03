import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MovieCard } from '@/components/MovieCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { GenreChart } from '@/components/GenreChart';
import { AdBanner } from '@/components/AdBanner';

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
  onMovieClick: (movieId: number) => void;
  contentType: 'movie' | 'tv';
  setContentType: (type: 'movie' | 'tv') => void;
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
  setSelectedYear,
  onMovieClick,
  contentType,
  setContentType
}: MovieGridProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMeanChart, setShowMeanChart] = useState(false);
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
      let url = `${TMDB_BASE_URL}/${contentType}/${currentCategory}?page=${page}`;
      
      if (selectedGenre !== 'all') {
        url += `&with_genres=${selectedGenre}`;
      }
      
      if (selectedYear !== 'all') {
        const yearParam = contentType === 'movie' ? 'primary_release_year' : 'first_air_date_year';
        url += `&${yearParam}=${selectedYear}`;
      }

      console.log('Fetching content from:', url);
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
      setTotalPages(Math.min(data.total_pages || 1, 100)); // Increased to 100 pages (2000 items)
      
      calculateStats(data.results || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (page: number) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const url = `${TMDB_BASE_URL}/search/${contentType}?query=${encodeURIComponent(searchQuery)}&page=${page}`;
      console.log('Searching content:', url);
      
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
      setTotalPages(Math.min(data.total_pages || 1, 100));
      
      calculateStats(data.results || []);
    } catch (error) {
      console.error('Error searching content:', error);
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
      {/* Mean Chart Toggle Buttons */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant={showMeanChart && contentType === 'movie' ? 'default' : 'outline'}
            onClick={() => {
              setContentType('movie');
              setShowMeanChart(true);
            }}
          >
            Mean Movies
          </Button>
          <Button
            variant={showMeanChart && contentType === 'tv' ? 'default' : 'outline'}
            onClick={() => {
              setContentType('tv');
              setShowMeanChart(true);
            }}
          >
            Mean TV Series
          </Button>
          <Button
            variant={!showMeanChart ? 'default' : 'outline'}
            onClick={() => setShowMeanChart(false)}
          >
            Browse Content
          </Button>
        </div>
      </div>

      {/* AdSense Banner */}
      <AdBanner 
        slot="5471985426"
        className="mb-6"
      />

      {/* Show Genre Chart when Mean buttons are clicked */}
      {showMeanChart && Object.keys(stats.genreStats).length > 0 && (
        <div className="mb-8">
          <GenreChart genreStats={stats.genreStats} />
        </div>
      )}

      {/* Content Type Toggle - only show when not in mean mode */}
      {!showMeanChart && (
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant={contentType === 'movie' ? 'default' : 'outline'}
              onClick={() => setContentType('movie')}
            >
              Movies
            </Button>
            <Button
              variant={contentType === 'tv' ? 'default' : 'outline'}
              onClick={() => setContentType('tv')}
            >
              TV Series
            </Button>
          </div>
        </div>
      )}

      {/* Category Tabs - only show when not in mean mode */}
      {!showMeanChart && (
        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6">
            {[
              { key: 'popular', label: 'Popular' },
              { key: 'top_rated', label: 'Top Rated' },
              { key: 'upcoming', label: contentType === 'movie' ? 'Upcoming' : 'On The Air' },
              { key: 'now_playing', label: contentType === 'movie' ? 'Now Playing' : 'Airing Today' }
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
      )}

      {/* Content Grid - only show when not in mean mode */}
      {!showMeanChart && (
        <>
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
                  <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
                ))}
              </div>
              
              {/* AdSense Banner between content and pagination */}
              <div className="my-8">
                <AdBanner slot="5471985426" />
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
                  Page {currentPage} of {totalPages} (Showing up to 2000 {contentType === 'movie' ? 'movies' : 'series'})
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {contentType === 'movie' ? 'movies' : 'series'} found. Try adjusting your filters or search query.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};
