import { useState, useEffect, memo } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Film, Tv } from 'lucide-react';

interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  overview?: string;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
}

interface SimilarMoviesProps {
  movieId: number;
  contentType: 'movie' | 'tv';
  onMovieClick: (movieId: number) => void;
  currentGenres?: number[];
  currentRating?: number;
  currentYear?: string;
  currentOverview?: string; // NEW: for keyword matching
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','not','no','so','if','then','than','that','this','it','its','he','she','his','her','they','them','their','we','our','you','your','who','which','what','when','where','how','from','into','about','after','before','between','under','over','out','up','down','all','each','every','both','few','more','most','other','some','such','only','own','same','very','just','also','as']);

// Extract meaningful keywords from overview
const extractKeywords = (text: string): Set<string> => {
  if (!text) return new Set();
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  );
};

export const SimilarMovies = memo(({ movieId, contentType, onMovieClick, currentGenres = [], currentRating = 0, currentYear = '', currentOverview = '' }: SimilarMoviesProps) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const currentKeywords = extractKeywords(currentOverview);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      setLoading(true);
      try {
        const headers = {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        };

        // Fetch from multiple sources including keywords endpoint
        const requests: Promise<Response>[] = [
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/similar?page=1`, { headers }),
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/similar?page=2`, { headers }),
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/recommendations?page=1`, { headers }),
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/recommendations?page=2`, { headers }),
        ];

        // Fetch keywords/tags for this movie to find thematically similar content
        const keywordsEndpoint = contentType === 'movie' ? 'keywords' : 'keywords';
        requests.push(
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/${keywordsEndpoint}`, { headers })
        );

        // Genre-based discover with ALL genres (strict match)
        if (currentGenres.length > 0) {
          const allGenres = currentGenres.join(',');
          // Strict: all genres must match
          requests.push(
            fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_genres=${allGenres}&sort_by=vote_average.desc&vote_count.gte=100&page=1`, { headers })
          );
          // Popular with same genres
          requests.push(
            fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_genres=${allGenres}&sort_by=popularity.desc&vote_count.gte=50&page=1`, { headers })
          );
          // If 3+ genres, also try top 2 for broader results
          if (currentGenres.length >= 3) {
            const topGenres = currentGenres.slice(0, 2).join(',');
            requests.push(
              fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_genres=${topGenres}&sort_by=vote_average.desc&vote_count.gte=200&page=1`, { headers })
            );
          }
        }

        const responses = await Promise.all(requests);
        const allData = await Promise.all(
          responses.map(r => r.ok ? r.json() : { results: [] })
        );

        // Extract keyword IDs from the keywords response (index 4)
        const keywordsData = allData[4];
        const movieKeywordIds: number[] = (keywordsData?.keywords || keywordsData?.results || []).map((k: any) => k.id);

        // If we got keyword IDs, fetch content with same keywords (most thematically similar)
        if (movieKeywordIds.length > 0) {
          const topKeywords = movieKeywordIds.slice(0, 5).join('|');
          try {
            const kwResponse = await fetch(
              `${TMDB_BASE_URL}/discover/${contentType}?with_keywords=${topKeywords}&sort_by=popularity.desc&vote_count.gte=20&page=1`,
              { headers }
            );
            if (kwResponse.ok) {
              const kwData = await kwResponse.json();
              allData.push(kwData);
            }
          } catch {}
        }

        // Combine all movie results (skip keywords response at index 4)
        const allResults: TMDBMovie[] = allData
          .filter((_, i) => i !== 4)
          .flatMap(data => data.results || []);

        // Deduplicate
        const uniqueResults = allResults.filter((item, index, self) =>
          item.id !== movieId &&
          item.poster_path &&
          index === self.findIndex(t => t.id === item.id)
        );

        // Enhanced similarity scoring
        const scoredResults = uniqueResults.map(item => {
          let score = 0;

          // Genre overlap (60 points max - increased importance)
          if (currentGenres.length > 0 && item.genre_ids?.length > 0) {
            const overlap = item.genre_ids.filter(g => currentGenres.includes(g)).length;
            const maxGenres = Math.max(currentGenres.length, item.genre_ids.length);
            // Bonus for exact genre match
            const exactMatch = overlap === currentGenres.length && overlap === item.genre_ids.length;
            score += (overlap / maxGenres) * 50 + (exactMatch ? 10 : 0);
          }

          // Overview keyword similarity (25 points max - story/theme matching)
          if (currentKeywords.size > 0 && item.overview) {
            const itemKeywords = extractKeywords(item.overview);
            let matchCount = 0;
            for (const kw of itemKeywords) {
              if (currentKeywords.has(kw)) matchCount++;
            }
            const kwScore = Math.min(25, (matchCount / Math.max(currentKeywords.size, 1)) * 40);
            score += kwScore;
          }

          // Rating similarity (10 points max)
          if (currentRating > 0 && item.vote_average > 0) {
            const ratingDiff = Math.abs(currentRating - item.vote_average);
            score += Math.max(0, 10 - ratingDiff * 2);
          }

          // Year proximity (5 points max)
          if (currentYear) {
            const itemYear = (item.release_date || item.first_air_date || '').split('-')[0];
            if (itemYear) {
              const diff = Math.abs(parseInt(currentYear) - parseInt(itemYear));
              if (!isNaN(diff)) score += Math.max(0, 5 - diff * 0.5);
            }
          }

          return { ...item, similarityScore: score };
        });

        scoredResults.sort((a, b) => b.similarityScore - a.similarityScore);

        const normalizedResults: Movie[] = scoredResults
          .slice(0, 30)
          .map(item => ({
            id: item.id,
            title: item.title || item.name || 'Unknown Title',
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date || item.first_air_date || '',
            genre_ids: item.genre_ids,
            media_type: contentType,
          }))
          .filter(item => item.title !== 'Unknown Title');

        setSimilarMovies(normalizedResults);
      } catch (error) {
        console.error('Error fetching similar content:', error);
        setSimilarMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [movieId, contentType]);

  const title = contentType === 'movie' ? 'Similar Movies' : 'Similar TV Series';

  if (loading) {
    return (
      <section className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (similarMovies.length === 0) {
    return (
      <section className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          {contentType === 'movie' ? <Film className="h-5 w-5 text-muted-foreground" /> : <Tv className="h-5 w-5 text-muted-foreground" />}
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            No similar {contentType === 'movie' ? 'movies' : 'series'} found
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{title}</h2>
        <Badge variant="secondary" className="ml-auto">{similarMovies.length} items</Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {similarMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
        ))}
      </div>
    </section>
  );
});

SimilarMovies.displayName = 'SimilarMovies';
