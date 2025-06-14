import { useState, useEffect } from 'react';

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  overview?: string;
  media_type?: 'movie' | 'tv';
}

// TMDB API credentials
const TMDB_API_KEY = '1177de48cd44943e60240337bac80877';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface UseMovieDataProps {
  searchQuery: string;
  selectedGenre: string;
  selectedYear: string;
  contentType: 'movie' | 'tv';
  currentCategory: string;
  currentPage: number;
  refreshKey?: number;
}

export const useMovieData = ({
  searchQuery,
  selectedGenre,
  selectedYear,
  contentType,
  currentCategory,
  currentPage,
  refreshKey = 0
}: UseMovieDataProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = async (page: number) => {
    setLoading(true);
    try {
      let url = `${TMDB_BASE_URL}/${contentType}/${currentCategory}?page=${page}`;
      
      // Build query parameters array
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (selectedGenre !== 'all') {
        params.append('with_genres', selectedGenre);
      }
      
      if (selectedYear !== 'all') {
        const yearParam = contentType === 'movie' ? 'primary_release_year' : 'first_air_date_year';
        params.append(yearParam, selectedYear);
      }

      // Add timestamp to prevent caching and get fresh data
      params.append('_t', Date.now().toString());

      // Construct final URL
      const finalUrl = `${TMDB_BASE_URL}/${contentType}/${currentCategory}?${params.toString()}`;

      console.log('Fetching content from:', finalUrl);
      const response = await fetch(finalUrl, {
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
      setTotalPages(Math.min(data.total_pages || 1, 100));
      
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
      const params = new URLSearchParams();
      params.append('query', searchQuery);
      params.append('page', page.toString());
      params.append('_t', Date.now().toString());
      
      const url = `${TMDB_BASE_URL}/search/multi?${params.toString()}`;
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
      
      const processedResults = (data.results || [])
        .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
        .map(item => {
          if (item.media_type === 'tv') {
            return {
              ...item,
              title: item.name,
              release_date: item.first_air_date,
            };
          }
          return item;
        });

      setMovies(processedResults);
      setTotalPages(Math.min(data.total_pages || 1, 100));
      
    } catch (error) {
      console.error('Error searching content:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchMovies(currentPage);
    } else {
      fetchMovies(currentPage);
    }
  }, [searchQuery, selectedGenre, selectedYear, contentType, currentCategory, currentPage, refreshKey]);

  return { movies, loading, totalPages };
};
