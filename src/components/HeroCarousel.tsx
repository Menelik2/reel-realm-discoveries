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

// TMDB API credentials
const TMDB_API_KEY = '1177de48cd44943e60240337bac80877';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const HeroCarousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(interval);
    }
  }, [movies]);

  const fetchTrendingMovies = async () => {
    try {
      const url = `${TMDB_BASE_URL}/trending/movie/week`;
      console.log('Fetching trending movies from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Trending movies response:', data);
      // Take only the first 5 movies for the carousel
      setMovies(data.results?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      setMovies([]);
    } finally {
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
      <div className="relative h-[50vh] md:h-[70vh] bg-muted animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">Loading trending movies...</div>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-gray-800 transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://image.tmdb.org/t/p/original${currentMovie.backdrop_path})`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl md:max-w-2xl text-white">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4 line-clamp-2">
              {currentMovie.title}
            </h1>
            <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-6 opacity-90 line-clamp-3">
              {currentMovie.overview}
            </p>
            <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
              <div className="bg-primary px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                ⭐ {currentMovie.vote_average.toFixed(1)}/10
              </div>
              <div className="text-xs md:text-sm opacity-75">
                {new Date(currentMovie.release_date).getFullYear()}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button size="sm" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Play className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Watch Trailer
              </Button>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black w-full sm:w-auto">
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
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
