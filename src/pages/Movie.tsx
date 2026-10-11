import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MovieDetails } from '@/components/MovieDetails';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const contentType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';

  // Keep theme consistent with user preference (do not force light mode)
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark =
      stored !== null
        ? stored === 'true'
        : window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    const root = document.documentElement;
    const body = document.body;
    if (prefersDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  const handleMovieClick = (movieId: number, typeOverride?: 'movie' | 'tv') => {
    const type = typeOverride || contentType;
    navigate(`/${type}/${movieId}`);
  };

  if (!id || isNaN(parseInt(id))) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Content ID</AlertTitle>
          <AlertDescription>
            The ID in the URL is not valid. Please go back and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <MovieDetails
        movieId={parseInt(id)}
        contentType={contentType as 'movie' | 'tv'}
        onClose={handleClose}
        onMovieClick={handleMovieClick}
      />
      <MobileBottomNav />
    </>
  );
};

export default MoviePage;
