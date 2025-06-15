
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  overview?: string;
  media_type?: 'movie' | 'tv';
  name?: string;
  first_air_date?: string;
}
