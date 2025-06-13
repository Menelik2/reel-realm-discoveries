
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Heart, Globe, Download, Eye } from 'lucide-react';
import { LiveWatchModal } from '@/components/LiveWatchModal';

interface MovieActionsProps {
  trailerUrl: string | null;
  homepage?: string;
  movieId: number;
  contentType: 'movie' | 'tv';
  title: string;
}

export const MovieActions = ({ trailerUrl, homepage, movieId, contentType, title }: MovieActionsProps) => {
  const [isLiveWatchOpen, setIsLiveWatchOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {trailerUrl && (
          <Button asChild>
            <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
              <Play className="mr-2 h-4 w-4" />
              Watch Trailer
            </a>
          </Button>
        )}
        <Button variant="outline" onClick={() => setIsLiveWatchOpen(true)}>
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
        {homepage && (
          <Button variant="outline" asChild>
            <a href={homepage} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              Official Site
            </a>
          </Button>
        )}
      </div>

      <LiveWatchModal
        isOpen={isLiveWatchOpen}
        onClose={() => setIsLiveWatchOpen(false)}
        movieId={movieId}
        contentType={contentType}
        title={title}
      />
    </>
  );
};
