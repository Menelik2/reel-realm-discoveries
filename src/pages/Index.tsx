
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieGrid } from '@/components/MovieGrid';
import { MovieDetails } from '@/components/MovieDetails';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 5 minutes to get new movies from TMDB
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing content from TMDB...');
      setRefreshKey(prev => prev + 1);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleMovieClick = (movieId: number) => {
    console.log('Movie clicked:', movieId);
    setSelectedMovieId(movieId);
  };

  const handleCloseMovieDetails = () => {
    setSelectedMovieId(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground transition-colors">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main>
          <HeroCarousel />
          
          <MovieGrid 
            key={refreshKey}
            searchQuery={searchQuery}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onMovieClick={handleMovieClick}
            contentType={contentType}
            setContentType={setContentType}
          />
        </main>

        <Footer />

        {/* Movie Details Modal */}
        {selectedMovieId && (
          <MovieDetails 
            movieId={selectedMovieId}
            contentType={contentType}
            onClose={handleCloseMovieDetails}
            onMovieClick={handleMovieClick}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
