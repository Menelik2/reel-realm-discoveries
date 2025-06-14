
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTopBoxOffice } from '@/hooks/useTopBoxOffice';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { AdBanner } from '@/components/AdBanner';
import { BoxOfficeMovieCard } from '@/components/BoxOfficeMovieCard';

const TopBoxOffice = () => {
  const { data: movies, isLoading, error } = useTopBoxOffice();

  const renderSkeletons = () => (
    [...Array(10)].map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-5 w-2/5 rounded-md" />
      </div>
    ))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery=""
        setSearchQuery={() => {}}
        isDarkMode={false}
        setIsDarkMode={() => {}}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Top Box Office (US)</h1>
            <p className="text-muted-foreground">
                This weekend's top-grossing movies, updated daily.
            </p>
        </div>

        <AdBanner slot="5471985426" className="mb-8" />
        
        {error && (
           <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Chart</AlertTitle>
            <AlertDescription>
              {error.message || "We couldn't fetch the latest box office data. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {!error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {isLoading ? renderSkeletons() : movies?.map((movie, index) => (
                <BoxOfficeMovieCard key={movie.id} movie={movie} rank={index + 1} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TopBoxOffice;
