
import { useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  overview?: string;
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
}

export const useMovieData = ({
  searchQuery,
  selectedGenre,
  selectedYear,
  contentType,
  currentCategory,
  currentPage
}: UseMovieDataProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

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
  }, [searchQuery, selectedGenre, selectedYear, contentType, currentCategory, currentPage]);

  return { movies, loading, totalPages };
};
