import { useState, useEffect } from 'react';
import { SimilarMovies } from '@/components/SimilarMovies';
import { MovieDetailsHeader } from '@/components/movie-details/MovieDetailsHeader';
import { MovieInfo } from '@/components/movie-details/MovieInfo';
import { ProductionDetails } from '@/components/movie-details/ProductionDetails';
import { MovieCast } from '@/components/movie-details/MovieCast';

interface MovieDetailsProps {
  movieId: number;
  contentType?: 'movie' | 'tv';
  onClose: () => void;
  onMovieClick: (movieId: number) => void;
}

interface MovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; name: string }[];
  budget?: number;
  revenue?: number;
  tagline?: string;
  homepage?: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface Videos {
  results: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  }[];
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const MovieDetails = ({ movieId, contentType = 'movie', onClose, onMovieClick }: MovieDetailsProps) => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId, contentType]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      // Fetch movie/series details
      const movieResponse = await fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const movieData = await movieResponse.json();
      setMovie(movieData);

      // Fetch cast
      const creditsResponse = await fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/credits`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const creditsData = await creditsResponse.json();
      setCast(creditsData.cast?.slice(0, 10) || []);

      // Fetch videos
      const videosResponse = await fetch(`${TMDB_BASE_URL}/${contentType}/${movieId}/videos`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const videosData = await videosResponse.json();
      setVideos(videosData);

    } catch (error) {
      console.error('Error fetching content details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrailerUrl = () => {
    const trailer = videos?.results?.find(video => 
      video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  };

  const handleSimilarMovieClick = (newMovieId: number) => {
    console.log('Opening similar movie:', newMovieId);
    onMovieClick(newMovieId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-background p-8 rounded-lg">
          <div className="animate-pulse">Loading {contentType === 'movie' ? 'movie' : 'series'} details...</div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const title = movie.title || movie.name || '';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const runtime = movie.runtime || (movie.episode_run_time?.[0]) || 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <MovieDetailsHeader 
          backdropPath={movie.backdrop_path}
          title={title}
          onClose={onClose}
        />

        <div className="p-6 -mt-20 relative z-10">
          <MovieInfo 
            posterPath={movie.poster_path}
            title={title}
            tagline={movie.tagline}
            voteAverage={movie.vote_average}
            voteCount={movie.vote_count}
            releaseDate={releaseDate}
            runtime={runtime}
            genres={movie.genres}
            overview={movie.overview}
            trailerUrl={getTrailerUrl()}
            homepage={movie.homepage}
            movieId={movieId}
            contentType={contentType}
          />

          <ProductionDetails 
            budget={movie.budget || 0}
            revenue={movie.revenue || 0}
            productionCountries={movie.production_countries}
            spokenLanguages={movie.spoken_languages}
            productionCompanies={movie.production_companies}
          />

          {/* Similar Movies/Series - Now with proper click handling */}
          <div className="mt-8">
            <SimilarMovies 
              movieId={movieId} 
              contentType={contentType}
              onMovieClick={handleSimilarMovieClick} 
            />
          </div>

          {/* Cast */}
          <MovieCast cast={cast} />
        </div>
      </div>
    </div>
  );
};
