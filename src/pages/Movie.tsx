
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MovieDetails } from '@/components/MovieDetails';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract content type from the current path
  const contentType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';

  // Always force white theme for now
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  const handleMovieClick = (movieId: number) => {
    // This allows clicking on similar movies to navigate to a new movie page
    navigate(`/${contentType}/${movieId}`);
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
    <MovieDetails 
      movieId={parseInt(id)}
      contentType={contentType as 'movie' | 'tv'}
      onClose={handleClose}
      onMovieClick={handleMovieClick}
    />
  );
};

export default MoviePage;
