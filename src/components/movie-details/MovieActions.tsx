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
  seasons?: any[];
}

export const MovieActions = ({ trailerUrl, homepage, movieId, contentType, title, seasons }: MovieActionsProps) => {
  const [isLiveWatchOpen, setIsLiveWatchOpen] = useState(false);

  const handleDownload = () => {
    // Redirect to IMDBot on Telegram, which handles both movies and series
    window.open('https://t.me/imdbot', '_blank');
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Primary action - Live Watch */}
        <Button 
          onClick={() => setIsLiveWatchOpen(true)}
          size="default"
          className="w-full sm:w-auto"
        >
          <Eye className="mr-2 h-4 w-4" />
          <span className="font-semibold">Watch Now</span>
        </Button>
        
        {/* Secondary actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {trailerUrl && (
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Trailer</span>
                <span className="sm:hidden">Play</span>
              </a>
            </Button>
          )}
          
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Heart className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Favorite</span>
            <span className="sm:hidden">Like</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Save</span>
          </Button>
          
          {homepage && (
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <a href={homepage} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Official</span>
                <span className="sm:hidden">Web</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      <LiveWatchModal
        isOpen={isLiveWatchOpen}
        onClose={() => setIsLiveWatchOpen(false)}
        movieId={movieId}
        contentType={contentType}
        title={title}
        seasons={seasons}
      />
    </>
  );
};
