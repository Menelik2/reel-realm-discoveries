import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieGrid } from "@/components/MovieGrid";
import { AdBanner } from "@/components/AdBanner";
import LiveWatchModal from "@/components/LiveWatchModal";
import { fetchMovies, searchContent } from "@/api/tmdbService";

const getInitialDarkMode = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return true; // Default to dark mode
};

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentCategory, setCurrentCategory] = useState<string>("popular");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // For Watch Now modal
  const [showWatchNow, setShowWatchNow] = useState(false);
  const [currentWatchType, setCurrentWatchType] = useState<"movie" | "tv">("movie");
  const [currentWatchId, setCurrentWatchId] = useState(""); // e.g. "tt1234567"

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

  // This handles opening the Watch Now modal with the correct type and id
  const handleWatchNow = (type: "movie" | "tv", id: string) => {
    setCurrentWatchType(type);
    setCurrentWatchId(id);
    setShowWatchNow(true);
  };

  const handleMovieClick = (movieId: number, typeOverride?: "movie" | "tv", imdbId?: string) => {
    let type: 'movie' | 'tv' = typeOverride ?? contentType;
    let id = imdbId || movieId.toString();
    // Open WatchNowModal with the right id/type (use imdbId if your API provides it)
    handleWatchNow(type, id);
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

        <LiveWatchModal
          open={showWatchNow}
          onClose={() => setShowWatchNow(false)}
          id={currentWatchId}
          type={currentWatchType}
        />

        {!isMobile && <Footer />}
      </div>
    </div>
  );
};

export default Index;
