
import { useState, useEffect } from 'react';

export interface Actor {
  id: number;
  name: string;
  biography: string;
  profile_path: string;
  birthday: string | null;
  place_of_birth: string | null;
}

export interface ActorCredit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  character: string;
  vote_average: number;
  vote_count?: number;
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  episode_count?: number;
}

interface ActorCredits {
  cast: ActorCredit[];
}

/** Talk shows, news and reality — not real acting credits. */
const EXCLUDED_GENRES = new Set([10767, 10763, 10764]);
const SELF_CHARACTER = /^(self|himself|herself|themselves)\b/i;

const isRealCredit = (c: ActorCredit) => {
  if (!c.poster_path) return false;
  if ((c.genre_ids || []).some((g) => EXCLUDED_GENRES.has(g))) return false;
  if (c.character && SELF_CHARACTER.test(c.character.trim())) return false;
  return true;
};

/** Weighted relevance: popularity blended with audience volume and quality. */
const creditScore = (c: ActorCredit) => {
  const votes = c.vote_count || 0;
  const rating = c.vote_average || 0;
  return (c.popularity || 0) * 0.4 + Math.log10(votes + 1) * 40 + rating * 4;
};


const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const useActorDetails = (actorId: number | null) => {
  const [actor, setActor] = useState<Actor | null>(null);
  const [credits, setCredits] = useState<ActorCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actorId) {
      setActor(null);
      setCredits([]);
      return;
    }

    const fetchActorDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        };

        const [actorResponse, creditsResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/person/${actorId}`, { headers }),
          fetch(`${TMDB_BASE_URL}/person/${actorId}/combined_credits`, { headers })
        ]);

        if (!actorResponse.ok) throw new Error(`Failed to fetch actor details. Status: ${actorResponse.status}`);
        if (!creditsResponse.ok) throw new Error(`Failed to fetch actor credits. Status: ${creditsResponse.status}`);
        
        const actorData = await actorResponse.json();
        const creditsData: ActorCredits = await creditsResponse.json();

        setActor(actorData);
        
        // Dedupe by title id (TMDB returns one row per character/season)
        const byId = new Map<number, ActorCredit>();
        for (const c of (creditsData.cast || []).filter(isRealCredit)) {
          const existing = byId.get(c.id);
          if (!existing || (c.episode_count || 0) > (existing.episode_count || 0)) {
            byId.set(c.id, c);
          }
        }

        const sortedCredits = Array.from(byId.values())
          .sort((a, b) => creditScore(b) - creditScore(a))
          .slice(0, 12);


        setCredits(sortedCredits);

      } catch (err) {
        console.error('Error fetching actor details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchActorDetails();
  }, [actorId]);

  return { actor, credits, loading, error };
};
