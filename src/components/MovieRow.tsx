
import { useState, useEffect } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/hooks/useMovieData';

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface MovieRowProps {
  title: string;
  fetchUrl: string;
  contentType: 'movie' | 'tv';
}

export const MovieRow = ({ title, fetchUrl, contentType }: MovieRowProps) => {
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${TMDB_BASE_URL}${fetchUrl}`, {
          headers: {
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
          }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const processedResults = (data.results || []).map((item: any) => {
            if (contentType === 'tv' || item.media_type === 'tv') {
                return {
                    ...item,
                    title: item.name,
                    release_date: item.first_air_date,
                    media_type: 'tv'
                };
            }
            return {
                ...item,
                media_type: item.media_type || 'movie'
            };
        });
        setItems(processedResults);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [fetchUrl, title, contentType]);
  
  const handleMovieClick = (movieId: number) => {
    const item = items.find(i => i.id === movieId);
    const type = item?.media_type || contentType;
    navigate(`/${type}/${movieId}`);
  };

  if (loading) {
    return (
      <section className="py-6 md:py-8">
        <h2 className="text-2xl font-bold mb-4 container mx-auto px-4">{title}</h2>
        <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-4 px-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[150px] sm:w-[180px]">
              <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8">
      <h2 className="text-2xl font-bold mb-4 container mx-auto px-4">{title}</h2>
      <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {items.map(item => (
          <div key={item.id} className="flex-shrink-0 w-[150px] sm:w-[180px]">
             <MovieCard movie={item} onMovieClick={handleMovieClick} />
          </div>
        ))}
      </div>
    </section>
  );
};
