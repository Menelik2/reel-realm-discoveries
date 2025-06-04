
import { useState, useEffect } from 'react';
import { SimilarMovies } from '@/components/SimilarMovies';
import { MovieDetailsHeader } from '@/components/movie-details/MovieDetailsHeader';
import { MovieInfo } from '@/components/movie-details/MovieInfo';
import { ProductionDetails } from '@/components/movie-details/ProductionDetails';
import { MovieCast } from '@/components/movie-details/MovieCast';

interface MovieDetailsProps {
  movieId: number;
  onClose: () => void;
}

interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; name: string }[];
  budget: number;
  revenue: number;
  tagline: string;
  homepage: string;
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

export const MovieDetails = ({ movieId, onClose }: MovieDetailsProps) => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      // Fetch movie details
      const movieResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const movieData = await movieResponse.json();
      setMovie(movieData);

      // Fetch cast
      const creditsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const creditsData = await creditsResponse.json();
      setCast(creditsData.cast?.slice(0, 10) || []);

      // Fetch videos
      const videosResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const videosData = await videosResponse.json();
      setVideos(videosData);

    } catch (error) {
      console.error('Error fetching movie details:', error);
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-background p-8 rounded-lg">
          <div className="animate-pulse">Loading movie details...</div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <MovieDetailsHeader 
          backdropPath={movie.backdrop_path}
          title={movie.title}
          onClose={onClose}
        />

        <div className="p-6 -mt-20 relative z-10">
          <MovieInfo 
            posterPath={movie.poster_path}
            title={movie.title}
            tagline={movie.tagline}
            voteAverage={movie.vote_average}
            voteCount={movie.vote_count}
            releaseDate={movie.release_date}
            runtime={movie.runtime}
            genres={movie.genres}
            overview={movie.overview}
            trailerUrl={getTrailerUrl()}
            homepage={movie.homepage}
          />

          <ProductionDetails 
            budget={movie.budget}
            revenue={movie.revenue}
            productionCountries={movie.production_countries}
            spokenLanguages={movie.spoken_languages}
            productionCompanies={movie.production_companies}
          />

          {/* Similar Movies - Now first */}
          <div className="mt-8">
            <SimilarMovies movieId={movieId} onMovieClick={onClose} />
          </div>

          {/* Cast - Now second */}
          <MovieCast cast={cast} />
        </div>
      </div>
    </div>
  );
};
