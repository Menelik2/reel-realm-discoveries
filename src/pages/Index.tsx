import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import MovieGrid from "@/components/MovieGrid";
import { AdBanner } from "@/components/AdBanner";
import WatchNowModal from "@/components/WatchNowModal";

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
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

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

  // Dummy fetch, replace with real API logic
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMovies([]);
      setTotalPages(1);
      setLoading(false);
    }, 500);
  }, [searchQuery, selectedGenre, selectedYear, contentType, currentCategory, currentPage, refreshKey]);

  const handleSetCurrentCategory = (category: string) => {
    setCurrentCategory(category);
    setRefreshKey(prev => prev + 1);
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

        <WatchNowModal
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
