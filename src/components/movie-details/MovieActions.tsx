
import { Button } from '@/components/ui/button';
import { Play, Heart, Globe, Download, Eye } from 'lucide-react';

interface MovieActionsProps {
  trailerUrl: string | null;
  homepage?: string;
}

export const MovieActions = ({ trailerUrl, homepage }: MovieActionsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {trailerUrl && (
        <Button asChild>
          <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
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
      {homepage && (
        <Button variant="outline" asChild>
          <a href={homepage} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" />
            Official Site
          </a>
        </Button>
      )}
    </div>
  );
};
