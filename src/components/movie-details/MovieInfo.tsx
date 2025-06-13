
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
  contentType
}: MovieInfoProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
      {/* Poster - responsive sizing */}
      <div className="flex-shrink-0 mx-auto lg:mx-0">
        <img
          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
          alt={title}
          className="w-40 h-60 sm:w-48 sm:h-72 lg:w-56 lg:h-84 object-cover rounded-lg shadow-xl"
        />
      </div>

      {/* Movie Info - better mobile layout */}
      <div className="flex-1 min-w-0">
        {/* Title - hidden on mobile since it's in header */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 hidden md:block">{title}</h1>
        
        {/* Mobile title for larger screens */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 md:hidden">{title}</h1>
        
        {tagline && (
          <p className="text-base sm:text-lg text-muted-foreground italic mb-4 line-clamp-2">{tagline}</p>
        )}

        {/* Stats - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            <span className="font-semibold">{voteAverage.toFixed(1)}/10</span>
            <span className="text-sm text-muted-foreground">({voteCount} votes)</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{new Date(releaseDate).getFullYear()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{runtime} min</span>
          </div>
        </div>

        {/* Genres - responsive */}
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map(genre => (
            <Badge key={genre.id} variant="secondary" className="text-xs sm:text-sm">
              {genre.name}
            </Badge>
          ))}
        </div>

        {/* Overview - responsive text */}
        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
          {overview}
        </p>

        {/* Actions - responsive buttons */}
        <MovieActions 
          trailerUrl={trailerUrl} 
          homepage={homepage}
          movieId={movieId}
          contentType={contentType}
          title={title}
        />
      </div>
    </div>
  );
};
