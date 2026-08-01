import type { ContentType } from '@/types/tmdb';
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieGrid } from "@/components/MovieGrid";
import { HomeCategoryRows } from "@/components/HomeCategoryRows";
import { SEOMetadata } from "@/components/SEOMetadata";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useMovieData } from "@/hooks/useMovieData";

const getInitialDarkMode = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'movie' || typeParam === 'tv' || typeParam === 'anime' || typeParam === 'asian') return typeParam;
    return 'all';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategory, setCurrentCategory] = useState<string>("popular");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Update search query from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Update content type from URL params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'movie' || typeParam === 'tv' || typeParam === 'anime' || typeParam === 'asian') {
      setContentType(typeParam);
    } else if (typeParam === null && contentType !== 'all') {
      setContentType('all');
    }
  }, [searchParams]);


  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply .dark class based on isDarkMode
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, selectedGenre, selectedYear, searchQuery, contentType]);

  // Only fetch via react-query when searching (HomeCategoryRows handles browse)
  const { movies, totalPages, loading } = useMovieData({
    searchQuery,
    selectedGenre: selectedGenre || 'all',
    selectedYear: selectedYear || 'all',
    contentType,
    currentCategory,
    currentPage,
    refreshKey,
    enabled: !!searchQuery,
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleMovieClick = (movieId: number, typeOverride?: "movie" | "tv") => {
    let type: 'movie' | 'tv';
    if (typeOverride) {
      type = typeOverride;
    } else if (contentType === 'movie' || contentType === 'tv') {
      type = contentType;
    } else {
      // Mixed collections (All / Anime / Asian) default to movie routing
      type = 'movie';
    }
    navigate(`/${type}/${movieId}`);
  };


  const handleSetCurrentCategory = (category: string) => {
    setCurrentCategory(category);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'dark' : ''}`}>
        <SEOMetadata 
          title="Watch Movies and TV Series Online Free - YENI MOVIE"
          description="Discover and watch the latest movies and TV series online for free. Browse thousands of titles, read reviews, watch trailers, and find your next favorite show on YENI MOVIE - your ultimate entertainment destination."
        />
      <div className="bg-background text-foreground transition-colors">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        <main>
          {!searchQuery && <HeroCarousel />}

          {searchQuery ? (
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
          ) : (
            <HomeCategoryRows
              contentType={contentType}
              setContentType={setContentType}
              onMovieClick={handleMovieClick}
            />
          )}
        </main>

        {!isMobile && <Footer />}
        <MobileBottomNav />
        
      </div>
    </div>
  );
};

export default Index;
