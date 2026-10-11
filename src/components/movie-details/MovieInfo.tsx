import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock } from 'lucide-react';
import { MovieActions } from './MovieActions';

interface Genre {
  id: number;
  name: string;
}

interface MovieInfoProps {
  posterPath: string;
  title: string;
  tagline?: string;
  voteAverage: number;
  voteCount: number;
  releaseDate: string;
  runtime: number;
  genres: Genre[];
  overview: string;
  trailerUrl: string | null;
  homepage?: string;
  movieId: number;
  contentType: 'movie' | 'tv';
  seasons?: any[];
  imdbId?: string;
}

export const MovieInfo = ({
  posterPath,
  title,
  tagline,
  voteAverage,
  voteCount,
  releaseDate,
  runtime,
  genres,
  overview,
  trailerUrl,
  homepage,
  movieId,
  contentType,
  seasons,
  imdbId,
}: MovieInfoProps) => {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div className="flex flex-col lg:flex-row gap-5 md:gap-8 lg:gap-10">
      {/* Poster */}
      <div className="flex-shrink-0 mx-auto lg:mx-0">
        <div
          className="rounded-2xl overflow-hidden ring-1 ring-border/50"
          style={{ boxShadow: 'var(--card-shadow-hover)' }}
        >
          <img
            src={posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '/placeholder.svg'}
            alt={title}
            className="w-40 h-60 sm:w-48 sm:h-72 lg:w-56 lg:h-[21rem] object-cover"
            width={500}
            height={750}
          />
        </div>
      </div>

      {/* Info — title always fully visible here (not in hero) */}
      <div className="flex-1 min-w-0 space-y-4 text-center lg:text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold tracking-tight mb-1.5 text-foreground">
            {title}
          </h1>
          {tagline && (
            <p className="text-sm sm:text-base text-muted-foreground italic line-clamp-2">
              {tagline}
            </p>
          )}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
          {voteAverage > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-secondary/80 border border-border/50 px-2.5 py-1.5 rounded-full">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
              <span className="text-sm font-semibold tabular-nums">{voteAverage.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">/ 10</span>
              {voteCount > 0 && (
                <span className="text-xs text-muted-foreground ml-0.5">
                  ({voteCount.toLocaleString()})
                </span>
              )}
            </div>
          )}
          {year && (
            <div className="inline-flex items-center gap-1.5 bg-secondary/80 border border-border/50 px-2.5 py-1.5 rounded-full text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium tabular-nums">{year}</span>
            </div>
          )}
          {runtime > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-secondary/80 border border-border/50 px-2.5 py-1.5 rounded-full text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium tabular-nums">{runtime} min</span>
            </div>
          )}
        </div>

        {/* Genres */}
        {genres?.length > 0 && (
          <div className="flex flex-wrap justify-center lg:justify-start gap-1.5">
            {genres.map(genre => (
              <Badge
                key={genre.id}
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium bg-secondary/90 border border-border/40"
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Overview */}
        {overview && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
            {overview}
          </p>
        )}

        <div className="pt-1 flex justify-center lg:justify-start">
          <MovieActions
            trailerUrl={trailerUrl}
            homepage={homepage}
            movieId={movieId}
            contentType={contentType}
            title={title}
            seasons={seasons}
            imdbId={imdbId}
          />
        </div>
      </div>
    </div>
  );
};
