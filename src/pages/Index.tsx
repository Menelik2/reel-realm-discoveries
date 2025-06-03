
import { useState } from 'react';
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

  const handleMovieClick = (movieId: number) => {
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
            onClose={handleCloseMovieDetails}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
