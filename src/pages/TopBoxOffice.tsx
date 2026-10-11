import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTopBoxOffice } from '@/hooks/useTopBoxOffice';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BarChart3 } from 'lucide-react';
import { BoxOfficeMovieCard } from '@/components/BoxOfficeMovieCard';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SEOMetadata } from '@/components/SEOMetadata';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const TopBoxOffice = () => {
  const { data: movies, isLoading, error } = useTopBoxOffice();
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [searchQuery, setSearchQuery] = useState('');

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
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const renderSkeletons = () =>
    [...Array(10)].map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-3 w-2/5 rounded-md" />
      </div>
    ));

  return (
    <div className="min-h-screen bg-background">
      <SEOMetadata
        title="Top Box Office (US)"
        description="This weekend's top-grossing movies in the US, updated daily."
      />
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="container mx-auto px-4 py-8 pb-28 md:pb-12">
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold tracking-tight">
              Top Box Office
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl ml-0 md:ml-12">
            This weekend's top-grossing movies in the US — updated daily.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto rounded-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Chart</AlertTitle>
            <AlertDescription>
              {error.message || "We couldn't fetch the latest box office data. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {!error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {isLoading ? renderSkeletons() : movies?.map((movie, index) => (
              <BoxOfficeMovieCard key={movie.id} movie={movie} rank={index + 1} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default TopBoxOffice;
