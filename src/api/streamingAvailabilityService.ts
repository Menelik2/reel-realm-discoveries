import type { Movie } from '@/types/tmdb';

const RAPIDAPI_KEY = 'bad9cc0b0emsh5c1e12f39fb94c8p1d9caajsnbfbb51f19de5';
const RAPIDAPI_HOST = 'streaming-availability.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const processStreamingResults = (results: any[]): Movie[] => {
  return (results || [])
    .filter(item => item.posterURLs?.original)
    .map((item: any): Movie => ({
      id: item.imdbId ? parseInt(item.imdbId.replace('tt', '')) : Math.random() * 1000000,
      title: item.title,
      poster_path: item.posterURLs?.original?.replace('https://image.tmdb.org/t/p/original', ''),
      backdrop_path: item.backdropURLs?.original?.replace('https://image.tmdb.org/t/p/original', ''),
      vote_average: item.imdbRating || 0,
      release_date: item.year ? `${item.year}-01-01` : '',
      genre_ids: item.genres?.map((g: any) => g.id) || [],
      overview: item.overview || '',
      media_type: item.showType === 'movie' ? 'movie' : 'tv',
    }));
};

const fetchFromStreamingAPI = async (endpoint: string, params: Record<string, string> = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  console.log('Fetching from Streaming API:', url.toString());
  const response = await fetch(url.toString(), {
    headers: {
      'X-Rapidapi-Key': RAPIDAPI_KEY,
      'X-Rapidapi-Host': RAPIDAPI_HOST,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Streaming API error! status: ${response.status}`);
  }
  
  return response.json();
};

export const fetchStreamingMovies = async (options: {
  contentType: 'movie' | 'tv';
  genre?: string;
  year?: string;
  page?: number;
  country?: string;
}) => {
  try {
    const params: Record<string, string> = {
      country: options.country || 'us',
      show_type: options.contentType === 'movie' ? 'movie' : 'series',
      output_language: 'en',
    };

    if (options.genre && options.genre !== 'all') {
      params.genre = options.genre;
    }
    
    if (options.year && options.year !== 'all') {
      params.year_min = options.year;
      params.year_max = options.year;
    }

    // Use the search endpoint for better results
    const data = await fetchFromStreamingAPI('/search/basic', params);
    
    const movies = processStreamingResults(data.result || []);
    
    return {
      movies: movies.slice(0, 20), // Limit results
      totalPages: Math.ceil(movies.length / 20) || 1,
    };
  } catch (error) {
    console.error('Error fetching from Streaming API:', error);
    return { movies: [], totalPages: 1 };
  }
};

export const searchStreamingContent = async (query: string, page: number = 1) => {
  try {
    const params = {
      title: query,
      country: 'us',
      output_language: 'en',
    };

    const data = await fetchFromStreamingAPI('/search/title', params);
    const movies = processStreamingResults(data.result || []);
    
    return {
      movies: movies.slice(0, 20),
      totalPages: Math.ceil(movies.length / 20) || 1,
    };
  } catch (error) {
    console.error('Error searching Streaming API:', error);
    return { movies: [], totalPages: 1 };
  }
};

export const fetchTrendingStreaming = async (contentType: 'movie' | 'tv') => {
  try {
    const params = {
      country: 'us',
      show_type: contentType === 'movie' ? 'movie' : 'series',
      order_by: 'popularity_1year',
      output_language: 'en',
    };

    const data = await fetchFromStreamingAPI('/search/filters', params);
    const movies = processStreamingResults(data.result || []);
    
    return {
      movies: movies.slice(0, 20),
      totalPages: 1,
    };
  } catch (error) {
    console.error('Error fetching trending from Streaming API:', error);
    return { movies: [], totalPages: 1 };
  }
};