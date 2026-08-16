import type { ContentType, Movie } from '@/types/tmdb';

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
  contentType: ContentType;
  selectedGenre: string;
  selectedYear: string;
  currentPage: number;
}

/** Origin countries treated as "Asian" content (drama/cinema from East & Southeast Asia). */
const ASIAN_ORIGIN_COUNTRIES = 'KR|JP|CN|TW|TH|HK';
const ANIMATION_GENRE_ID = '16';

/**
 * Anime and Asian are cross-media collections (movies + series), so they are
 * resolved with TMDB /discover using language and origin-country filters.
 */
const fetchCuratedCollection = async (
  kind: 'anime' | 'asian',
  { currentCategory, selectedGenre, selectedYear, currentPage }: Omit<FetchMoviesParams, 'contentType'>,
) => {
  const buildUrl = (media: 'movie' | 'tv') => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('sort_by', currentCategory === 'top_rated' ? 'vote_average.desc' : 'popularity.desc');
    params.append('vote_count.gte', currentCategory === 'top_rated' ? '150' : '20');

    const genres: string[] = [];
    if (kind === 'anime') {
      genres.push(ANIMATION_GENRE_ID);
      params.append('with_original_language', 'ja');
    } else {
      params.append('with_origin_country', ASIAN_ORIGIN_COUNTRIES);
    }
    if (selectedGenre !== 'all') genres.push(selectedGenre);
    if (genres.length) params.append('with_genres', genres.join(','));

    if (selectedYear !== 'all') {
      params.append(media === 'movie' ? 'primary_release_year' : 'first_air_date_year', selectedYear);
    }

    if (currentCategory === 'latest_releases' || currentCategory === 'now_playing' || currentCategory === 'upcoming') {
      const now = new Date();
      const dateField = media === 'movie' ? 'primary_release_date' : 'first_air_date';
      if (currentCategory === 'upcoming') {
        params.append(`${dateField}.gte`, now.toISOString().split('T')[0]);
      } else {
        const from = new Date(now.getFullYear(), now.getMonth() - (currentCategory === 'latest_releases' ? 1 : 2), now.getDate());
        params.append(`${dateField}.gte`, from.toISOString().split('T')[0]);
        params.append(`${dateField}.lte`, now.toISOString().split('T')[0]);
      }
    }

    return `${TMDB_BASE_URL}/discover/${media}?${params.toString()}`;
  };

  const [movieData, tvData] = await Promise.all([
    fetchFromTMDB(buildUrl('movie')),
    fetchFromTMDB(buildUrl('tv')),
  ]);

  const combined = [
    ...processTMDbResults(movieData.results, 'movie'),
    ...processTMDbResults(tvData.results, 'tv'),
  ].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

  return {
    movies: combined.slice(0, 20),
    totalPages: Math.min(Math.max(movieData.total_pages || 1, tvData.total_pages || 1), 100),
  };
};

export const fetchMovies = async ({ currentCategory, contentType, selectedGenre, selectedYear, currentPage }: FetchMoviesParams) => {
    if (contentType === 'anime' || contentType === 'asian') {
        return fetchCuratedCollection(contentType, { currentCategory, selectedGenre, selectedYear, currentPage });
    }


    // Mixed "all": prefer a single multi endpoint when possible (half the network)
    if (contentType === 'all') {
        const getDailyPageOffset = () => {
          const today = new Date();
          const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
          return dayOfYear % 10;
        };
        const dailyOffset = getDailyPageOffset();
        const page = currentPage + ((currentCategory === 'popular' || currentCategory === 'trending_week' || currentCategory === 'top_rated') ? dailyOffset : 0);

        // Single call for popular / trending
        if (currentCategory === 'popular' || currentCategory === 'trending_week') {
            const data = await fetchFromTMDB(
              `${TMDB_BASE_URL}/trending/all/week?page=${page}`
            );
            return {
              movies: processTMDbResults(data.results),
              totalPages: Math.min(data.total_pages || 1, 100),
            };
        }

        if (currentCategory === 'top_rated') {
            // discover movie top-rated only (one request) — still mixed enough for home rows
            const params = new URLSearchParams({
              page: String(page),
              sort_by: 'vote_average.desc',
              'vote_count.gte': '300',
            });
            if (selectedGenre !== 'all') params.set('with_genres', selectedGenre);
            if (selectedYear !== 'all') params.set('primary_release_year', selectedYear);
            const data = await fetchFromTMDB(`${TMDB_BASE_URL}/discover/movie?${params}`);
            return {
              movies: processTMDbResults(data.results, 'movie'),
              totalPages: Math.min(data.total_pages || 1, 100),
            };
        }

        // Fallback: parallel movie + tv (remaining categories)
        const [movieResults, tvResults] = await Promise.all([
            fetchMovies({ currentCategory, contentType: 'movie', selectedGenre, selectedYear, currentPage }),
            fetchMovies({ currentCategory, contentType: 'tv', selectedGenre, selectedYear, currentPage })
        ]);
        const combinedMovies = [...movieResults.movies, ...tvResults.movies]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 20);
        return {
            movies: combinedMovies,
            totalPages: Math.max(movieResults.totalPages, tvResults.totalPages),
        };
    }

    // Rotate popular content daily by picking a different page offset based on the date
    const getDailyPageOffset = () => {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      return (dayOfYear % 10); // cycles through 0-9 extra pages
    };

    const supportsFiltering = currentCategory === 'popular' || currentCategory === 'top_rated';
    const useDiscover = (selectedGenre !== 'all' || selectedYear !== 'all') && supportsFiltering;

    let url;
    const params = new URLSearchParams();
    // Apply daily rotation for popular/trending/top_rated so content changes each day
    const dailyOffset = getDailyPageOffset();
    const shouldRotate = currentCategory === 'popular' || currentCategory === 'trending_week' || currentCategory === 'top_rated';
    const effectivePage = shouldRotate ? currentPage + dailyOffset : currentPage;
    params.append('page', effectivePage.toString());

    let apiCategory = currentCategory;
    if (contentType === 'tv') {
        if (apiCategory === 'upcoming') apiCategory = 'on_the_air';
        else if (apiCategory === 'now_playing') apiCategory = 'airing_today';
    }

    // Handle new categories
    if (currentCategory === 'trending_week') {
        url = `${TMDB_BASE_URL}/trending/${contentType}/week`;
    } else if (currentCategory === 'latest_releases') {
        // Use discover with very recent release dates (last month)
        url = `${TMDB_BASE_URL}/discover/${contentType}`;
        const currentDate = new Date();
        const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        
        if (contentType === 'movie') {
            params.append('primary_release_date.gte', oneMonthAgo.toISOString().split('T')[0]);
            params.append('primary_release_date.lte', currentDate.toISOString().split('T')[0]);
        } else {
            params.append('first_air_date.gte', oneMonthAgo.toISOString().split('T')[0]);
            params.append('first_air_date.lte', currentDate.toISOString().split('T')[0]);
        }
        params.append('sort_by', 'popularity.desc');
        params.append('vote_count.gte', '10');
    } else if (useDiscover) {
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

    // Removed cache-busting timestamp - react-query handles cache invalidation
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
  contentType?: ContentType;
}

export const searchContent = async ({ searchQuery, currentPage, contentType }: SearchContentParams) => {
    const params = new URLSearchParams();
    params.append('query', searchQuery);
    params.append('page', currentPage.toString());

    // Use specific search endpoint if a single media type is provided, otherwise search all
    const singleType = contentType === 'movie' || contentType === 'tv' ? contentType : undefined;
    const searchEndpoint = singleType ? `search/${singleType}` : 'search/multi';
    const url = `${TMDB_BASE_URL}/${searchEndpoint}?${params.toString()}`;
    const data = await fetchFromTMDB(url);

    return {
        movies: processTMDbResults(data.results, singleType),
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
