
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
  popularity: number;
}

interface ActorCredits {
  cast: ActorCredit[];
}

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
        
        const sortedCredits = creditsData.cast
          .filter(c => c.poster_path)
          .sort((a, b) => b.popularity - a.popularity)
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
