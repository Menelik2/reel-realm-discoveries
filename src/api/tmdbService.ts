import type { Movie } from '@/types/tmdb';

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const processTMDbResults = (results: any[], knownType?: 'movie' | 'tv'): Movie[] => {
  return (results || [])
    .filter(item => (item.media_type === 'movie' || item.media_type === 'tv' || !!knownType) && item.poster_path)
    .map((item: any): Movie => {
      const media_type = item.media_type || knownType;
      
      if (media_type === 'tv') {
        return {
          ...item,
          title: item.name || item.original_name,
          release_date: item.first_air_date,
          media_type: 'tv',
        };
      }
      
      return {
        ...item,
        title: item.title || item.original_title,
        release_date: item.release_date,
        media_type: 'movie',
      };
    });
};

const fetchFromTMDB = async (url: string) => {
    console.log('Fetching from:', url);
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

interface FetchMoviesParams {
  currentCategory: string;
  contentType: 'movie' | 'tv';
  selectedGenre: string;
  selectedYear: string;
  currentPage: number;
}

export const fetchMovies = async ({ currentCategory, contentType, selectedGenre, selectedYear, currentPage }: FetchMoviesParams) => {
    const supportsFiltering = currentCategory === 'popular' || currentCategory === 'top_rated';
    const useDiscover = (selectedGenre !== 'all' || selectedYear !== 'all') && supportsFiltering;

    let url;
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());

    let apiCategory = currentCategory;
    if (contentType === 'tv') {
        if (apiCategory === 'upcoming') apiCategory = 'on_the_air';
        else if (apiCategory === 'now_playing') apiCategory = 'airing_today';
    }

    if (useDiscover) {
        url = `${TMDB_BASE_URL}/discover/${contentType}`;
        if (selectedGenre !== 'all') params.append('with_genres', selectedGenre);
        if (selectedYear !== 'all') {
            const yearParam = contentType === 'movie' ? 'primary_release_year' : 'first_air_date_year';
            params.append(yearParam, selectedYear);
        }
        if (currentCategory === 'popular') params.append('sort_by', 'popularity.desc');
        else if (currentCategory === 'top_rated') {
            params.append('sort_by', 'vote_average.desc');
            params.append('vote_count.gte', '300');
        }
    } else {
        url = `${TMDB_BASE_URL}/${contentType}/${apiCategory}`;
    }

    params.append('_t', Date.now().toString());
    const finalUrl = `${url}?${params.toString()}`;
    const data = await fetchFromTMDB(finalUrl);

    return {
        movies: processTMDbResults(data.results, contentType),
        totalPages: Math.min(data.total_pages || 1, 100),
    };
};

interface SearchContentParams {
  searchQuery: string;
  currentPage: number;
}

export const searchContent = async ({ searchQuery, currentPage }: SearchContentParams) => {
    const params = new URLSearchParams();
    params.append('query', searchQuery);
    params.append('page', currentPage.toString());
    params.append('_t', Date.now().toString());

    const url = `${TMDB_BASE_URL}/search/multi?${params.toString()}`;
    const data = await fetchFromTMDB(url);

    return {
        movies: processTMDbResults(data.results),
        totalPages: Math.min(data.total_pages || 1, 100),
    };
};

export const fetchMovieDetails = async (id: number, contentType: 'movie' | 'tv') => {
    const url = `${TMDB_BASE_URL}/${contentType}/${id}?append_to_response=videos,credits`;
    const data = await fetchFromTMDB(url);

    return {
        movie: data,
        cast: data.credits?.cast?.slice(0, 10) || [],
        videos: data.videos,
    };
};
