import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieGrid } from '@/components/MovieGrid';
import { Footer } from '@/components/Footer';
import { useMovieData } from '@/hooks/useMovieData';
import { AdBanner } from '@/components/AdBanner';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { InterstitialAd } from '@/components/InterstitialAd';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [adTargetUrl, setAdTargetUrl] = useState<string | null>(null);

  const [currentCategory, setCurrentCategory] = useState(
    () => searchParams.get('category') || 'popular'
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Effect to sync category from URL to state, e.g. on back/forward
  useEffect(() => {
    setCurrentCategory(searchParams.get('category') || 'popular');
  }, [searchParams]);

  const { movies, loading, totalPages } = useMovieData({
    searchQuery,
    selectedGenre,
    selectedYear,
    contentType,
    currentCategory,
    currentPage,
    refreshKey,
    enabled: true,
  });

  // Auto-refresh every day to get new movies from TMDB
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing content from TMDB...');
      setRefreshKey(prev => prev + 1);
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, selectedGenre, selectedYear, searchQuery, contentType]);

  // Always force white theme for now
  useEffect(() => {
    setIsDarkMode(false);
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleMovieClick = (movieId: number) => {
    let type: 'movie' | 'tv' = contentType;
    if (searchQuery) {
      const movie = movies.find(m => m.id === movieId);
      if (movie && movie.media_type && (movie.media_type === 'movie' || movie.media_type === 'tv')) {
        type = movie.media_type;
      }
    }
    console.log('Showing ad before navigating to:', `/${type}/${movieId}`);
    setAdTargetUrl(`/${type}/${movieId}`);
  };

  const handleSetCurrentCategory = (category: string) => {
    setCurrentCategory(category);
    const params = new URLSearchParams(searchParams);
    params.set('category', category);
    setSearchParams(params, { replace: true });
    
    // Reset filters for categories that don't support filtering
    if (category !== 'popular' && category !== 'top_rated') {
      setSelectedGenre('all');
      setSelectedYear('all');
    }
  };

  const handleAdContinue = () => {
    if (adTargetUrl) {
      navigate(adTargetUrl);
      setAdTargetUrl(null);
    }
  };

  const handleAdClose = () => {
    setAdTargetUrl(null);
  };

  return (
    <div className={`min-h-screen ${isMobile ? 'pb-16' : ''}`}>
      <div className="bg-background text-foreground transition-colors">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main>
          {!searchQuery && <HeroCarousel />}
          
          <>
            {!searchQuery && currentCategory !== 'custom' && (
              <div className="container mx-auto px-4 my-8">
                <AdBanner slot="1571190202" />
              </div>
            )}
            
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
              movies={movies}
              loading={loading}
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              currentCategory={currentCategory}
              setCurrentCategory={handleSetCurrentCategory}
              isMobile={isMobile}
            />
          </>
        </main>

        {!isMobile && <Footer />}
        {isMobile && <MobileBottomNav />}
      </div>
      {adTargetUrl && (
        <InterstitialAd 
          onContinue={handleAdContinue}
          onClose={handleAdClose}
        />
      )}
    </div>
  );
};

export default Index;
