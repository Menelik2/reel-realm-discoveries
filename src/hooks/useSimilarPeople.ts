import { useEffect, useState } from 'react';
import type { ActorCredit } from './useActorDetails';

export interface SimilarPerson {
  id: number;
  name: string;
  profile_path: string | null;
  sharedCount: number;
  sharedTitles: string[];
  popularity: number;
}

const TMDB_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const resolveType = (c: ActorCredit): 'movie' | 'tv' => {
  if (c.media_type === 'movie' || c.media_type === 'tv') return c.media_type;
  if (c.title || c.release_date) return 'movie';
  return 'tv';
};

export const useSimilarPeople = (
  actorId: number | null,
  credits: ActorCredit[],
) => {
  const [people, setPeople] = useState<SimilarPerson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!actorId || credits.length === 0) {
      setPeople([]);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const headers = {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        };

        const top = credits.slice(0, 6);
        const results = await Promise.all(
          top.map(async (c) => {
            const type = resolveType(c);
            const res = await fetch(
              `${TMDB_BASE_URL}/${type}/${c.id}/credits`,
              { headers },
            );
            if (!res.ok) return { title: c.title || c.name || '', cast: [] };
            const data = await res.json();
            return {
              title: c.title || c.name || '',
              cast: (data.cast || []).slice(0, 15),
            };
          }),
        );

        const map = new Map<number, SimilarPerson>();
        for (const { title, cast } of results) {
          for (const person of cast) {
            if (person.id === actorId) continue;
            if (!person.profile_path) continue;
            const existing = map.get(person.id);
            if (existing) {
              existing.sharedCount += 1;
              if (!existing.sharedTitles.includes(title))
                existing.sharedTitles.push(title);
            } else {
              map.set(person.id, {
                id: person.id,
                name: person.name,
                profile_path: person.profile_path,
                sharedCount: 1,
                sharedTitles: title ? [title] : [],
                popularity: person.popularity || 0,
              });
            }
          }
        }

        const sorted = Array.from(map.values())
          .sort(
            (a, b) =>
              b.sharedCount - a.sharedCount || b.popularity - a.popularity,
          )
          .slice(0, 12);

        if (!cancelled) setPeople(sorted);
      } catch (e) {
        console.error('Similar people error:', e);
        if (!cancelled) setPeople([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [actorId, credits]);

  return { people, loading };
};
