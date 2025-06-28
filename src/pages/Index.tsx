import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import MovieGrid from "@/components/MovieGrid";
import { AdBanner } from "@/components/AdBanner";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Always force white theme for now
  useEffect(() => {
    setIsDarkMode(false);
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, selectedGenre, selectedYear, searchQuery, contentType]);

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
    // Implement navigation or modal opening here
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

        {!isMobile && <Footer />}
      </div>
    </div>
  );
};

export default Index;
