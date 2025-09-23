import { Card, CardContent } from '@/components/ui/card';
import type { Movie } from '@/types/tmdb';

interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movieId: number) => void;
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
      onMovieClick(movie.id);
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
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
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
