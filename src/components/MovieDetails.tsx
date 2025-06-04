
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Heart, Star, Calendar, Clock, Globe, Download, Eye } from 'lucide-react';
import { SimilarMovies } from '@/components/SimilarMovies';

interface MovieDetailsProps {
  movieId: number;
  onClose: () => void;
}

interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; name: string }[];
  budget: number;
  revenue: number;
  tagline: string;
  homepage: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface Videos {
  results: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  }[];
}

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const MovieDetails = ({ movieId, onClose }: MovieDetailsProps) => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      // Fetch movie details
      const movieResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const movieData = await movieResponse.json();
      setMovie(movieData);

      // Fetch cast
      const creditsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const creditsData = await creditsResponse.json();
      setCast(creditsData.cast?.slice(0, 10) || []);

      // Fetch videos
      const videosResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      const videosData = await videosResponse.json();
      setVideos(videosData);

    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTrailerUrl = () => {
    const trailer = videos?.results?.find(video => 
      video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-background p-8 rounded-lg">
          <div className="animate-pulse">Loading movie details...</div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
        {/* Header with backdrop */}
        <div className="relative h-64 md:h-80">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            ✕
          </Button>
        </div>

        <div className="p-6 -mt-20 relative z-10">
          {/* Movie Info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-lg shadow-lg mx-auto md:mx-0"
            />

            {/* Movie Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">{movie.tagline}</p>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}/10</span>
                  <span className="text-sm text-muted-foreground">({movie.vote_count} votes)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{movie.runtime} min</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map(genre => (
                  <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                ))}
              </div>

              <p className="text-muted-foreground mb-6">{movie.overview}</p>

              <div className="flex flex-wrap gap-3">
                {getTrailerUrl() && (
                  <Button asChild>
                    <a href={getTrailerUrl()!} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Trailer
                    </a>
                  </Button>
                )}
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Live Watch
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Favorites
                </Button>
                {movie.homepage && (
                  <Button variant="outline" asChild>
                    <a href={movie.homepage} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Official Site
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Production Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Production Details</h3>
                <div className="space-y-2 text-sm">
                  {movie.budget > 0 && (
                    <div>
                      <span className="font-medium">Budget:</span> {formatCurrency(movie.budget)}
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div>
                      <span className="font-medium">Revenue:</span> {formatCurrency(movie.revenue)}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Countries:</span> {movie.production_countries.map(c => c.name).join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Languages:</span> {movie.spoken_languages.map(l => l.english_name).join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Companies */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Production Companies</h3>
                <div className="space-y-2">
                  {movie.production_companies.slice(0, 5).map(company => (
                    <div key={company.id} className="flex items-center gap-2">
                      {company.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          className="h-8 w-auto"
                        />
                      )}
                      <span className="text-sm">{company.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Similar Movies - Now first */}
          <div className="mt-8">
            <SimilarMovies movieId={movieId} onMovieClick={onClose} />
          </div>

          {/* Cast - Now second */}
          {cast.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Cast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {cast.map(actor => (
                  <div key={actor.id} className="text-center">
                    <img
                      src={actor.profile_path 
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : '/placeholder.svg'
                      }
                      alt={actor.name}
                      className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                    />
                    <p className="font-medium text-sm">{actor.name}</p>
                    <p className="text-xs text-muted-foreground">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
