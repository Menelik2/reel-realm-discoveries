import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieGrid } from "@/components/MovieGrid";
import { HomeCategoryRows } from "@/components/HomeCategoryRows";
import { SEOMetadata } from "@/components/SEOMetadata";
import { MobileBottomNav } from "@/components/MobileBottomNav";

import { fetchMovies, searchContent } from "@/api/tmdbService";
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
  const [contentType, setContentType] = useState<"movie" | "tv" | "all">(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'movie' || typeParam === 'tv') return typeParam;
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
    if (typeParam === 'movie' || typeParam === 'tv') {
      setContentType(typeParam);
    } else if (typeParam === null && contentType !== 'all') {
      // Only reset to 'all' if explicitly on home without type param
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleMovieClick = (movieId: number, typeOverride?: "movie" | "tv") => {
    // For 'all' content type, we need to determine the actual type from the movie data or typeOverride
    let type: 'movie' | 'tv';
    if (typeOverride) {
      type = typeOverride;
    } else if (contentType === 'all') {
      // This should be handled by the movie card which knows the media_type
      type = 'movie'; // fallback, but the MovieCard should provide typeOverride
    } else {
      type = contentType;
    }
    navigate(`/${type}/${movieId}`);
  };

  // Fetch movies from TMDB API
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        let result;
        if (searchQuery) {
          result = await searchContent({
            searchQuery,
            currentPage,
            contentType,
          });
        } else {
          result = await fetchMovies({
            currentCategory,
            contentType,
            selectedGenre: selectedGenre || 'all',
            selectedYear: selectedYear || 'all',
            currentPage,
          });
        }
        setMovies(result.movies);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error fetching content:', error);
        setMovies([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [searchQuery, selectedGenre, selectedYear, contentType, currentCategory, currentPage, refreshKey]);

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
