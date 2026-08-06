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
        requests.push(
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/keywords`, { headers })
        );

        // Genre-based discover with ALL genres (strict match)
        if (currentGenres.length > 0) {
          const allGenres = currentGenres.join(',');
          requests.push(
            fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_genres=${allGenres}&sort_by=vote_average.desc&vote_count.gte=100&page=1`, { headers })
          );
          requests.push(
            fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_genres=${allGenres}&sort_by=popularity.desc&vote_count.gte=50&page=1`, { headers })
          );
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
        const movieKeywordIdSet = new Set<number>(movieKeywordIds);

        // Fetch keyword-based results — heavily weighted, multiple angles for storyline match
        const keywordResultIds = new Set<number>();
        if (movieKeywordIds.length > 0) {
          const topKeywords = movieKeywordIds.slice(0, 8);
          const kwRequests: Promise<Response>[] = [];

          // AND match (all top 3 keywords) — strongest thematic match
          if (topKeywords.length >= 2) {
            const strictKw = topKeywords.slice(0, 3).join(',');
            kwRequests.push(
              fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_keywords=${strictKw}&sort_by=popularity.desc&vote_count.gte=10&page=1`, { headers })
            );
          }
          // OR match with genre filter (thematic + tonal)
          const orKw = topKeywords.join('|');
          const genreFilter = currentGenres.length > 0 ? `&with_genres=${currentGenres.slice(0, 3).join(',')}` : '';
          kwRequests.push(
            fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_keywords=${orKw}${genreFilter}&sort_by=popularity.desc&vote_count.gte=20&page=1`, { headers })
          );
          kwRequests.push(
            fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_keywords=${orKw}${genreFilter}&sort_by=vote_average.desc&vote_count.gte=50&page=1`, { headers })
          );

          try {
            const kwResponses = await Promise.all(kwRequests);
            const kwDataArr = await Promise.all(kwResponses.map(r => r.ok ? r.json() : { results: [] }));
            for (const kwData of kwDataArr) {
              for (const r of (kwData.results || [])) keywordResultIds.add(r.id);
              allData.push(kwData);
            }
          } catch {}
        }

        // Fetch keywords for top candidates to score shared TMDB keywords (parallel, capped)
        const preAllResults: TMDBMovie[] = allData
          .filter((_, i) => i !== 4)
          .flatMap(data => data.results || []);
        const preUnique = preAllResults.filter((item, index, self) =>
          item.id !== movieId &&
          item.poster_path &&
          index === self.findIndex(t => t.id === item.id)
        );

        // Fetch keywords for up to 40 candidates to compute shared-keyword overlap
        const candidateKeywords = new Map<number, Set<number>>();
        if (movieKeywordIdSet.size > 0) {
          const toFetch = preUnique.slice(0, 60);
          const kwFetches = toFetch.map(async (item) => {
            try {
              const r = await fetch(`${TMDB_BASE_URL}/${contentType}/${item.id}/keywords`, { headers });
              if (!r.ok) return;
              const j = await r.json();
              const ids: number[] = (j?.keywords || j?.results || []).map((k: any) => k.id);
              candidateKeywords.set(item.id, new Set(ids));
            } catch {}
          });
          await Promise.all(kwFetches);
        }

        const uniqueResults = preUnique;

        // Enhanced similarity scoring — storyline/topic weighted heavily
        const scoredResults = uniqueResults.map(item => {
          let score = 0;

          // Shared TMDB keywords (70 points max) — strongest storyline/topic signal
          let sharedKw = 0;
          const itemKwIds = candidateKeywords.get(item.id);
          if (movieKeywordIdSet.size > 0 && itemKwIds && itemKwIds.size > 0) {
            for (const id of itemKwIds) if (movieKeywordIdSet.has(id)) sharedKw++;
            const denom = Math.max(1, Math.min(movieKeywordIdSet.size, itemKwIds.size));
            score += Math.min(70, (sharedKw / denom) * 90);
            if (sharedKw >= 2) score += 10; // multiple shared topics = same subject matter
          }

          // Boost items surfaced by keyword-discover queries
          if (keywordResultIds.has(item.id)) score += 20;

          // Genre overlap (30 points max)
          if (currentGenres.length > 0 && item.genre_ids?.length > 0) {
            const overlap = item.genre_ids.filter(g => currentGenres.includes(g)).length;
            const maxGenres = Math.max(currentGenres.length, item.genre_ids.length);
            const exactMatch = overlap === currentGenres.length && overlap === item.genre_ids.length;
            score += (overlap / maxGenres) * 24 + (exactMatch ? 6 : 0);
          }

          // Overview keyword similarity (35 points max) — plot/story text match
          let overviewMatches = 0;
          if (currentKeywords.size > 0 && item.overview) {
            const itemKeywords = extractKeywords(item.overview);
            for (const kw of itemKeywords) if (currentKeywords.has(kw)) overviewMatches++;
            score += Math.min(35, (overviewMatches / Math.max(currentKeywords.size, 1)) * 60);
          }

          // Require a real story/topic signal, not just genre
          const hasStorySignal = sharedKw > 0 || overviewMatches >= 2 || keywordResultIds.has(item.id);
          if (!hasStorySignal) score -= 25;

          // Rating similarity (8 points max)
          if (currentRating > 0 && item.vote_average > 0) {
            const ratingDiff = Math.abs(currentRating - item.vote_average);
            score += Math.max(0, 8 - ratingDiff * 1.5);
          }

          // Year proximity (4 points max)
          if (currentYear) {
            const itemYear = (item.release_date || item.first_air_date || '').split('-')[0];
            if (itemYear) {
              const diff = Math.abs(parseInt(currentYear) - parseInt(itemYear));
              if (!isNaN(diff)) score += Math.max(0, 4 - diff * 0.4);
            }
          }

          return { ...item, similarityScore: score };
        });


        scoredResults.sort((a, b) => b.similarityScore - a.similarityScore);

        const storyMatches = scoredResults.filter(i => i.similarityScore > 0);
        const ranked = storyMatches.length >= 20 ? storyMatches : scoredResults;

        const normalizedResults: Movie[] = ranked
          .slice(0, 20)
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
