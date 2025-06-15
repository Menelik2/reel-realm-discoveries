
import { useQuery } from '@tanstack/react-query';
import { MovieCard } from '@/components/MovieCard';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/types/tmdb';

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface MovieRowProps {
  title: string;
  fetchUrl: string;
  contentType: 'movie' | 'tv';
}

const fetchItems = async (fetchUrl: string, contentType: 'movie' | 'tv'): Promise<Movie[]> => {
  const response = await fetch(`${TMDB_BASE_URL}${fetchUrl}`, {
    headers: {
      'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json;charset=utf-8'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  
  return (data.results || []).map((item: any) => {
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
};

export const MovieRow = ({ title, fetchUrl, contentType }: MovieRowProps) => {
  const navigate = useNavigate();

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['movieRow', { fetchUrl, contentType }],
    queryFn: () => fetchItems(fetchUrl, contentType),
  });
  
  const handleMovieClick = (movieId: number) => {
    const item = items.find(i => i.id === movieId);
    const type = item?.media_type || contentType;
    navigate(`/${type}/${movieId}`);
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
        {items.map(item => (
          <MovieCard key={item.id} movie={item} onMovieClick={handleMovieClick} />
        ))}
      </div>
    </section>
  );
};
