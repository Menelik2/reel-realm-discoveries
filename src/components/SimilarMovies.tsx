import { useState, useEffect, memo } from 'react';
import { MovieCard } from '@/components/MovieCard';
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
  currentOverview?: string;
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','not','no','so','if','then','than','that','this','it','its','he','she','his','her','they','them','their','we','our','you','your','who','which','what','when','where','how','from','into','about','after','before','between','under','over','out','up','down','all','each','every','both','few','more','most','other','some','such','only','own','same','very','just','also','as']);

const CARD_WIDTH = 'w-[132px] sm:w-[148px] md:w-[168px] lg:w-[180px]';

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

        const requests: Promise<Response>[] = [
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/similar?page=1`, { headers }),
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/recommendations?page=1`, { headers }),
        ];

        requests.push(
          fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/keywords`, { headers })
        );

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

        const keywordsData = allData[2];
        const movieKeywordIds: number[] = (keywordsData?.keywords || keywordsData?.results || []).map((k: any) => k.id);
        const movieKeywordIdSet = new Set<number>(movieKeywordIds);

        const keywordResultIds = new Set<number>();
        if (movieKeywordIds.length > 0) {
          const topKeywords = movieKeywordIds.slice(0, 8);
          const kwRequests: Promise<Response>[] = [];

          if (topKeywords.length >= 2) {
            const strictKw = topKeywords.slice(0, 3).join(',');
            kwRequests.push(
              fetch(`${TMDB_BASE_URL}/discover/${contentType}?with_keywords=${strictKw}&sort_by=popularity.desc&vote_count.gte=10&page=1`, { headers })
            );
          }
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

        const preAllResults: TMDBMovie[] = allData
          .filter((_, i) => i !== 2)
          .flatMap(data => data.results || []);
        const preUnique = preAllResults.filter((item, index, self) =>
          item.id !== movieId &&
          item.poster_path &&
          index === self.findIndex(t => t.id === item.id)
        );

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

        const scoredResults = uniqueResults.map(item => {
          let score = 0;

          let sharedKw = 0;
          const itemKwIds = candidateKeywords.get(item.id);
          if (movieKeywordIdSet.size > 0 && itemKwIds && itemKwIds.size > 0) {
            for (const id of itemKwIds) if (movieKeywordIdSet.has(id)) sharedKw++;
            const denom = Math.max(1, Math.min(movieKeywordIdSet.size, itemKwIds.size));
            score += Math.min(70, (sharedKw / denom) * 90);
            if (sharedKw >= 2) score += 10;
          }

          if (keywordResultIds.has(item.id)) score += 20;

          if (currentGenres.length > 0 && item.genre_ids?.length > 0) {
            const overlap = item.genre_ids.filter(g => currentGenres.includes(g)).length;
            const maxGenres = Math.max(currentGenres.length, item.genre_ids.length);
            const exactMatch = overlap === currentGenres.length && overlap === item.genre_ids.length;
            score += (overlap / maxGenres) * 24 + (exactMatch ? 6 : 0);
          }

          let overviewMatches = 0;
          if (currentKeywords.size > 0 && item.overview) {
            const itemKeywords = extractKeywords(item.overview);
            for (const kw of itemKeywords) if (currentKeywords.has(kw)) overviewMatches++;
            score += Math.min(35, (overviewMatches / Math.max(currentKeywords.size, 1)) * 60);
          }

          const hasStorySignal = sharedKw > 0 || overviewMatches >= 2 || keywordResultIds.has(item.id);
          if (!hasStorySignal) score -= 25;

          if (currentRating > 0 && item.vote_average > 0) {
            const ratingDiff = Math.abs(currentRating - item.vote_average);
            score += Math.max(0, 8 - ratingDiff * 1.5);
          }

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
        const ranked = storyMatches.length >= 10 ? storyMatches : scoredResults;

        const normalizedResults: Movie[] = ranked
          .slice(0, 12)
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
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg md:text-xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="media-row">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`${CARD_WIDTH} aspect-[2/3] bg-secondary/80 animate-pulse rounded-2xl`} />
          ))}
        </div>
      </section>
    );
  }

  if (similarMovies.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          {contentType === 'movie' ? <Film className="h-4 w-4 text-muted-foreground" /> : <Tv className="h-4 w-4 text-muted-foreground" />}
          <h2 className="text-lg md:text-xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-border/40 bg-card/40">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No similar {contentType === 'movie' ? 'movies' : 'series'} found
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-lg md:text-xl font-bold tracking-tight">{title}</h2>
        <span className="text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full tabular-nums">
          {similarMovies.length}
        </span>
      </div>
      <div className="media-row-edge">
        <div className="media-row">
          {similarMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onMovieClick={onMovieClick}
              className={CARD_WIDTH}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

SimilarMovies.displayName = 'SimilarMovies';
