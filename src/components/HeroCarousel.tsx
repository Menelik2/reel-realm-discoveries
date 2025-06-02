
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export const HeroCarousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  const fetchTrendingMovies = async () => {
    try {
      // For now, using mock data. In a real app, you'd use TMDB API
      const mockMovies: Movie[] = [
        {
          id: 1,
          title: "The Dark Knight",
          overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
          backdrop_path: "/placeholder-backdrop1.jpg",
          poster_path: "/placeholder-poster1.jpg",
          vote_average: 9.0,
          release_date: "2008-07-18"
        },
        {
          id: 2,
          title: "Inception",
          overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          backdrop_path: "/placeholder-backdrop2.jpg",
          poster_path: "/placeholder-poster2.jpg",
          vote_average: 8.8,
          release_date: "2010-07-16"
        },
        {
          id: 3,
          title: "Interstellar",
          overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
          backdrop_path: "/placeholder-backdrop3.jpg",
          poster_path: "/placeholder-poster3.jpg",
          vote_average: 8.6,
          release_date: "2014-11-07"
        }
      ];
      setMovies(mockMovies);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  if (loading || movies.length === 0) {
    return (
      <div className="relative h-[70vh] bg-muted animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">Loading trending movies...</div>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-gray-800"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://image.tmdb.org/t/p/original${currentMovie.backdrop_path})`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {currentMovie.title}
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              {currentMovie.overview}
            </p>
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary px-3 py-1 rounded-full text-sm font-semibold">
                ⭐ {currentMovie.vote_average}/10
              </div>
              <div className="text-sm opacity-75">
                {new Date(currentMovie.release_date).getFullYear()}
              </div>
            </div>
            <div className="flex space-x-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Play className="mr-2 h-4 w-4" />
                Watch Trailer
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-black">
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
