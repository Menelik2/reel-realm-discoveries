
import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieGrid } from '@/components/MovieGrid';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
          />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
