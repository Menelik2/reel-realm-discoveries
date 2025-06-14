
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MovieDetails } from '@/components/MovieDetails';

const MoviePage = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Validate parameters
  useEffect(() => {
    if (!id || !type || (type !== 'movie' && type !== 'tv')) {
      navigate('/');
    }
  }, [id, type, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/${type}/${movieId}`);
  };

  if (!id || !type) {
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
            contentType={type as 'movie' | 'tv'}
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
