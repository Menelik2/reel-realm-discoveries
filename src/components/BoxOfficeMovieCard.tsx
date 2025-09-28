
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { BoxOfficeMovie } from '@/hooks/useTopBoxOffice';
import { Card, CardContent } from '@/components/ui/card';

interface BoxOfficeMovieCardProps {
  movie: BoxOfficeMovie;
  rank: number;
}

export const BoxOfficeMovieCard = ({ movie, rank }: BoxOfficeMovieCardProps) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  return (
    <div className="relative group">
      <Link to={`/movie/${movie.id}`} className="block">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
          <CardContent className="p-0">
            <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-base font-bold shadow-lg border-2 border-background">
              {rank}
            </div>
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-auto aspect-[2/3] object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="p-3">
              <h3 className="font-bold text-base truncate" title={movie.title}>
                {movie.title}
              </h3>
              <p className="text-sm text-muted-foreground">{movie.release_date}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-sm">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};
