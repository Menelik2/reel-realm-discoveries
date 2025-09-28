import { Card, CardContent } from '@/components/ui/card';
import { OptimizedImage } from '@/components/OptimizedImage';
import type { Movie } from '@/types/tmdb';

interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movieId: number, mediaType?: 'movie' | 'tv') => void;
  fullPosterUrl?: string;
}

export const MovieCard = ({ movie, onMovieClick, fullPosterUrl }: MovieCardProps) => {
  
  const posterUrl = fullPosterUrl
    ? fullPosterUrl
    : movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  const handleCardClick = () => {
    if (onMovieClick) {
      // Pass the media_type from the movie object for correct navigation
      const mediaType = movie.media_type || 'movie';
      onMovieClick(movie.id, mediaType);
    }
  };

  const getReleaseYear = (date?: string) => {
    if (date && date.length >= 4) {
      return date.substring(0, 4);
    }
    return 'N/A';
  }

  return (
    <Card className="group hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-0">
        <div className="relative aspect-[2/3] overflow-hidden">
          <OptimizedImage
            src={posterUrl}
            tmdbPath={movie.poster_path}
            imageType="poster"
            alt={movie.title || 'Movie poster'}
            className="transition-transform duration-300 group-hover:scale-110"
            placeholder="blur"
          />
        </div>
        
        <div className="p-2 md:p-3">
          <h3 className="font-semibold text-xs md:text-sm line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {movie.vote_average > 0 ? (
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
            ) : (
              <span />
            )}
            <span>{getReleaseYear(movie.release_date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
