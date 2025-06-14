
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTopBoxOffice } from '@/hooks/useTopBoxOffice';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Star } from "lucide-react";
import { Link } from 'react-router-dom';
import { AdBanner } from '@/components/AdBanner';

const TopBoxOffice = () => {
  const { data: movies, isLoading, error } = useTopBoxOffice();

  const renderSkeletons = () => (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-24 w-16 rounded-md" /></TableCell>
          <TableCell>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
        </TableRow>
      ))}
    </div>
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
        <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-center">Top Box Office (US)</h1>
        <p className="text-center text-muted-foreground mb-8">
          Based on movies currently playing in theaters in the United States.
        </p>

        <AdBanner slot="5471985426" className="mb-8" />
        
        {error && (
           <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Chart</AlertTitle>
            <AlertDescription>
              We couldn't fetch the latest box office data. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {!error && (
          <div className="overflow-hidden rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">Rank</TableHead>
                  <TableHead className="w-[100px]">Poster</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Release Date</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeletons() : movies?.map((movie, index) => (
                  <TableRow key={movie.id}>
                    <TableCell className="font-bold text-center text-lg">{index + 1}</TableCell>
                    <TableCell>
                      <Link to={`/movie/${movie.id}`}>
                        <img 
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.svg'} 
                          alt={movie.title}
                          className="h-24 w-auto rounded-md object-cover transition-transform hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/movie/${movie.id}`} className="font-semibold hover:underline">
                        {movie.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{movie.release_date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TopBoxOffice;
