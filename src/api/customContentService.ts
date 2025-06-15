
import { supabase } from '@/integrations/supabase/client';
import type { Movie } from '@/types/tmdb';

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const processItem = (item: any): Movie => {
  const isMovie = !!item.title;
  return {
    ...item,
    title: item.title || item.name,
    release_date: item.release_date || item.first_air_date,
    media_type: isMovie ? 'movie' : 'tv',
  };
};

export const fetchCustomContent = async () => {
    const { data: customContent, error: supabaseError } = await (supabase.from as any)('custom_content')
        .select('tmdb_id, content_type')
        .order('created_at', { ascending: false });

    if (supabaseError) throw supabaseError;
    
    if (!customContent || customContent.length === 0) {
        return { movies: [], totalPages: 1 };
    }

    const moviePromises = customContent.map((item: { tmdb_id: number; content_type: 'movie' | 'tv' }) => {
        const url = `${TMDB_BASE_URL}/${item.content_type}/${item.tmdb_id}`;
        return fetch(url, {
            headers: { 
              'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
              'Content-Type': 'application/json;charset=utf-8'
            }
        }).then(res => res.ok ? res.json() : null);
    });
    
    const results = (await Promise.all(moviePromises)).filter(Boolean);
    const processedResults = results.map(processItem);

    return { movies: processedResults, totalPages: 1 };
};
