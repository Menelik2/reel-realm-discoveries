
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
  homepage
}: MovieInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Poster */}
      <img
        src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        alt={title}
        className="w-48 h-72 object-cover rounded-lg shadow-lg mx-auto md:mx-0"
      />

      {/* Movie Info */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {tagline && (
          <p className="text-lg text-muted-foreground italic mb-4">{tagline}</p>
        )}

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{voteAverage.toFixed(1)}/10</span>
            <span className="text-sm text-muted-foreground">({voteCount} votes)</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(releaseDate).getFullYear()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{runtime} min</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map(genre => (
            <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
          ))}
        </div>

        <p className="text-muted-foreground mb-6">{overview}</p>

        <MovieActions trailerUrl={trailerUrl} homepage={homepage} />
      </div>
    </div>
  );
};
