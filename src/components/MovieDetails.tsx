import { useEffect, useState } from 'react';
import { SimilarMovies } from '@/components/SimilarMovies';
import { MovieDetailsHeader } from '@/components/movie-details/MovieDetailsHeader';
import { MovieInfo } from '@/components/movie-details/MovieInfo';
import { ProductionDetails } from '@/components/movie-details/ProductionDetails';
import { MovieCast } from '@/components/movie-details/MovieCast';
import { useMovieDetails } from '@/hooks/useMovieDetails';
import { MovieDetailsSkeleton } from './movie-details/MovieDetailsSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ActorDetails } from './actor/ActorDetails';
import { SEOMetadata } from './SEOMetadata';
import { AdBanner } from '@/components/AdBanner';

interface MovieDetailsProps {
  movieId: number;
  contentType?: 'movie' | 'tv';
  onClose: () => void;
  onMovieClick: (movieId: number, contentType?: 'movie' | 'tv') => void;
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
    onMovieClick(newMovieId, contentType);
  };

  const handleActorClick = (actorId: number) => {
    setSelectedActorId(actorId);
  };

  const handleCloseActorDetails = () => {
    setSelectedActorId(null);
  };

  const handleActorMovieClick = (movieId: number, contentType: 'movie' | 'tv') => {
    setSelectedActorId(null);
    onMovieClick(movieId, contentType);
  };

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

  if (!movie) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            No details available for this {contentType === 'movie' ? 'movie' : 'series'}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
        releaseDate={releaseDate}
        rating={movie.vote_average}
        genres={movie.genres?.map(g => g.name) || []}
        cast={cast.slice(0, 5).map(c => c.name)}
        director={cast.find(c => c.character?.toLowerCase().includes('director'))?.name}
        duration={runtime}
        voteCount={movie.vote_count}
        numberOfSeasons={contentType === 'tv' ? (movie as any).number_of_seasons : undefined}
        numberOfEpisodes={contentType === 'tv' ? (movie as any).number_of_episodes : undefined}
      />

      <div className="min-h-screen w-full pb-20 md:pb-8">
        <MovieDetailsHeader
          backdropPath={movie.backdrop_path}
          title={title}
          onClose={onClose}
        />

        <div className="container mx-auto px-4 py-6 -mt-16 sm:-mt-20 relative z-10 max-w-7xl">
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
            seasons={movie.seasons}
            imdbId={movie.imdb_id}
          />

          <div className="mt-10">
            <ProductionDetails
              budget={movie.budget || 0}
              revenue={movie.revenue || 0}
              productionCountries={movie.production_countries}
              spokenLanguages={movie.spoken_languages}
              productionCompanies={movie.production_companies}
            />
          </div>

          <AdBanner slot="1571190202" className="my-8" />

          {movie.id && (
            <div className="mt-10">
              <SimilarMovies
                movieId={movie.id}
                contentType={contentType}
                onMovieClick={handleSimilarMovieClick}
                currentGenres={movie.genres?.map(g => g.id) || []}
                currentRating={movie.vote_average}
                currentYear={releaseDate.split('-')[0] || ''}
                currentOverview={movie.overview || ''}
              />
            </div>
          )}

          {cast.length > 0 && (
            <section className="mt-10 mb-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Top Cast</h2>
                <span className="text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full tabular-nums">
                  {Math.min(cast.length, 16)}
                </span>
              </div>
              <MovieCast cast={cast} onActorClick={handleActorClick} />
            </section>
          )}
        </div>
      </div>

      <ActorDetails
        actorId={selectedActorId}
        onClose={handleCloseActorDetails}
        onMovieClick={handleActorMovieClick}
      />
    </div>
  );
};
