import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  enabled?: boolean;
}

export const useMovieData = ({
  searchQuery,
  selectedGenre,
  selectedYear,
  contentType,
  currentCategory,
  currentPage,
  refreshKey = 0,
  enabled = true,
}: UseMovieDataProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = async (page: number) => {
    setLoading(true);
    try {
      const supportsFiltering = currentCategory === 'popular' || currentCategory === 'top_rated';
      const useDiscover = (selectedGenre !== 'all' || selectedYear !== 'all') && supportsFiltering;

      let url;
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      // Map categories for TV shows
      let apiCategory = currentCategory;
      if (contentType === 'tv') {
        if (apiCategory === 'upcoming') {
          apiCategory = 'on_the_air';
        } else if (apiCategory === 'now_playing') {
          apiCategory = 'airing_today';
        }
      }
      
      if (useDiscover) {
        url = `${TMDB_BASE_URL}/discover/${contentType}`;
        
        if (selectedGenre !== 'all') {
          params.append('with_genres', selectedGenre);
        }
        
        if (selectedYear !== 'all') {
          const yearParam = contentType === 'movie' ? 'primary_release_year' : 'first_air_date_year';
          params.append(yearParam, selectedYear);
        }

        if (currentCategory === 'popular') {
          params.append('sort_by', 'popularity.desc');
        } else if (currentCategory === 'top_rated') {
          params.append('sort_by', 'vote_average.desc');
          params.append('vote_count.gte', '300');
        }
      } else {
        url = `${TMDB_BASE_URL}/${contentType}/${apiCategory}`;
      }

      // Add timestamp to prevent caching and get fresh data
      params.append('_t', Date.now().toString());

      // Construct final URL
      const finalUrl = `${url}?${params.toString()}`;

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

  const fetchCustomContent = async () => {
    setLoading(true);
    try {
      const { data: customContent, error: supabaseError } = await (supabase.from as any)('custom_content')
        .select('tmdb_id, content_type')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      if (!customContent || customContent.length === 0) {
        setMovies([]);
        setTotalPages(1);
        return;
      }

      const moviePromises = customContent.map((item: { tmdb_id: number; content_type: 'movie' | 'tv' }) => {
        const url = `${TMDB_BASE_URL}/${item.content_type}/${item.tmdb_id}`;
        return fetch(url, {
          headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
          }
        }).then(res => res.ok ? res.json() : null);
      });
      
      const results = (await Promise.all(moviePromises)).filter(Boolean);
      
      const processedResults = results.map(item => {
        const isMovie = !!item.title;
        return {
          ...item,
          title: item.title || item.name,
          release_date: item.release_date || item.first_air_date,
          media_type: isMovie ? 'movie' : 'tv',
        };
      });

      setMovies(processedResults);
      setTotalPages(1); // No pagination for custom list for now

    } catch (error) {
      console.error('Error fetching custom content:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setMovies([]);
      setLoading(false);
      return;
    }

    if (searchQuery) {
      searchMovies(currentPage);
    } else if (currentCategory === 'custom') {
      fetchCustomContent();
    }
    else {
      fetchMovies(currentPage);
    }
  }, [searchQuery, selectedGenre, selectedYear, contentType, currentCategory, currentPage, refreshKey, enabled]);

  return { movies, loading, totalPages };
};
