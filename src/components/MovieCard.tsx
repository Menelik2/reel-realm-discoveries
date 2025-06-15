import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart } from 'lucide-react';
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
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-1 md:space-x-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="text-xs px-2 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle trailer click
                }}
              >
                <Play className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Trailer</span>
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="px-2 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle favorite click
                }}
              >
                <Heart className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
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
