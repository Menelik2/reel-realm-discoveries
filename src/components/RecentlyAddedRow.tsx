
import { useState, useEffect } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { useNavigate } from 'react-router-dom';

// This is a subset of the Movie type from useMovieData, just what MovieCard needs.
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface VidSrcItem {
  imdb_id: string;
  tmdb_id: string;
  title: string;
  name?: string; // for tv shows
  poster: string;
  quality: string;
  year: string;
}

interface RecentlyAddedRowProps {
  title: string;
  contentType: 'movie' | 'tv';
}

export const RecentlyAddedRow = ({ title, contentType }: RecentlyAddedRowProps) => {
  const [items, setItems] = useState<VidSrcItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const type = contentType === 'movie' ? 'movies' : 'tvshows';
        const response = await fetch(`https://vidsrc.xyz/${type}/latest/page-1.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Assuming the data has a 'result' property which is an array
        setItems(data.result || []);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [contentType, title]);
  
  const handleMovieClick = (movieId: number) => {
    navigate(`/${contentType}/${movieId}`);
  };

  if (loading) {
    return (
      <section className="py-6 md:py-8 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8 container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {items.slice(0, 12).map(item => {
          if (!item.tmdb_id) return null; // Make sure we have an ID to navigate to
          
          const movieForCard: Movie = {
            id: parseInt(item.tmdb_id, 10),
            title: item.title || item.name || 'No Title',
            poster_path: '', // we use fullPosterUrl instead
            vote_average: 0, // not provided by this API
            release_date: item.year,
          };

          return (
            <MovieCard 
              key={item.imdb_id} 
              movie={movieForCard} 
              onMovieClick={handleMovieClick}
              fullPosterUrl={item.poster}
            />
          );
        })}
      </div>
    </section>
  );
};
