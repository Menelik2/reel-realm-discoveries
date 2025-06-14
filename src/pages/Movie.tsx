
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MovieDetails } from '@/components/MovieDetails';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Extract content type from the current path
  const contentType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';

  // Validate parameters
  useEffect(() => {
    if (!id) {
      navigate('/');
    }
  }, [id, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/${contentType}/${movieId}`);
  };

  if (!id) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground transition-colors">
        <Header 
          searchQuery=""
          setSearchQuery={() => {}}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main>
          <MovieDetails 
            movieId={parseInt(id)}
            contentType={contentType as 'movie' | 'tv'}
            onClose={handleClose}
            onMovieClick={handleMovieClick}
          />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MoviePage;
