
import { useEffect, useState } from 'react';
import { SimilarMovies } from '@/components/SimilarMovies';
import { MovieDetailsHeader } from '@/components/movie-details/MovieDetailsHeader';
import { MovieInfo } from '@/components/movie-details/MovieInfo';
import { ProductionDetails } from '@/components/movie-details/ProductionDetails';
import { MovieCast } from '@/components/movie-details/MovieCast';
import { useMovieDetails } from '@/hooks/useMovieDetails';
import { MovieDetailsSkeleton } from './movie-details/MovieDetailsSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ActorDetails } from './actor/ActorDetails';
import { SEOMetadata } from './SEOMetadata';

interface MovieDetailsProps {
  movieId: number;
  contentType?: 'movie' | 'tv';
  onClose: () => void;
  onMovieClick: (movieId: number) => void;
}

export const MovieDetails = ({ movieId, contentType = 'movie', onClose, onMovieClick }: MovieDetailsProps) => {
  const { movie, cast, videos, loading, error } = useMovieDetails(movieId, contentType);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);

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

  const handleActorClick = (actorId: number) => {
    setSelectedActorId(actorId);
  };

  const handleCloseActorDetails = () => {
    setSelectedActorId(null);
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedActorId) {
          handleCloseActorDetails();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, selectedActorId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (loading) {
    return <MovieDetailsSkeleton />;
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to load details</AlertTitle>
          <AlertDescription>
            {error} Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!movie) return null;

  const title = movie.title || movie.name || '';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const runtime = movie.runtime || (movie.episode_run_time?.[0]) || 0;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <SEOMetadata
        title={title}
        description={movie.overview}
        imageUrl={movie.poster_path}
        contentType={contentType}
        movieId={movie.id}
      />
      {/* Full-size container */}
      <div className="min-h-screen w-full">
        <MovieDetailsHeader 
          backdropPath={movie.backdrop_path}
          title={title}
          onClose={onClose}
        />

        <div className="container mx-auto px-4 py-6 -mt-20 relative z-10 max-w-7xl">
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

          <div className="mt-8">
            <ProductionDetails 
              budget={movie.budget || 0}
              revenue={movie.revenue || 0}
              productionCountries={movie.production_countries}
              spokenLanguages={movie.spoken_languages}
              productionCompanies={movie.production_companies}
            />
          </div>
          
          {/* Similar Movies/Series */}
          {movie.id && (
            <div className="mt-8">
              <SimilarMovies 
                movieId={movie.id} 
                contentType={contentType}
                onMovieClick={handleSimilarMovieClick} 
              />
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mt-8">
               <Card>
                <CardHeader>
                  <CardTitle>Top Cast</CardTitle>
                </CardHeader>
                <CardContent>
                  <MovieCast cast={cast} onActorClick={handleActorClick} />
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
      <ActorDetails actorId={selectedActorId} onClose={handleCloseActorDetails} />
    </div>
  );
};
