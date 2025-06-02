
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  return (
    <Card className="group hover:scale-105 transition-all duration-300 overflow-hidden">
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
              <Button size="sm" variant="secondary" className="text-xs px-2 py-1">
                <Play className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Trailer</span>
              </Button>
              <Button size="sm" variant="secondary" className="px-2 py-1">
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
            <span>⭐ {movie.vote_average.toFixed(1)}</span>
            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
