import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Heart, Globe, Download, Eye, Send, Share2 } from 'lucide-react';
import LiveWatchModal from '@/components/LiveWatchModal';
import DownloadModal from '@/components/DownloadModal';
import { useTelegramUrl } from '@/hooks/useTelegramUrl';
import { toast } from 'sonner';

const SUPABASE_URL = "https://suxbqdcnidvdfmkrshem.supabase.co";

interface MovieActionsProps {
  trailerUrl: string | null;
  homepage?: string;
  movieId: number;
  contentType: 'movie' | 'tv';
  title: string;
  seasons?: any[];
  imdbId?: string;
}

export const MovieActions = ({ trailerUrl, homepage, movieId, contentType, title, seasons, imdbId }: MovieActionsProps) => {
  const [isLiveWatchOpen, setIsLiveWatchOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  
  // Get Telegram URL for TV series
  const { data: telegramUrl } = useTelegramUrl(contentType === 'tv' ? {
    id: movieId,
    media_type: 'tv',
    title,
    name: title,
    imdb_id: imdbId
  } as any : null);

  const handleDownload = () => {
    setIsDownloadOpen(true);
  };

  const handleShare = async () => {
    // Use the Supabase edge function URL for sharing — it serves proper OG meta tags
    // (movie poster, title, description) for social media crawlers, then redirects users to the real page
    const shareUrl = `${SUPABASE_URL}/functions/v1/og-image/${contentType}/${movieId}`;
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Watch ${title} on YENI MOVIE`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
      }
    }
    
    // Fall back to copying to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!', {
        description: 'Share this link to show the movie poster on social media',
      });
    } catch (err) {
      toast.error('Failed to copy link');
    }
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
          
          {/* Download button for both movies and TV series */}
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Download</span>
          </Button>
          
          {/* Telegram button for TV series */}
          {contentType === 'tv' && telegramUrl && (
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={() => window.open(telegramUrl, '_blank')}
            >
              <Send className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Telegram</span>
              <span className="sm:hidden">Telegram Download</span>
            </Button>
          )}
          
          {/* Share button */}
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
            <span className="sm:hidden">Share</span>
          </Button>
          
          {/* Official button - use homepage if available, otherwise TMDB page */}
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <a 
              href={homepage || `https://www.themoviedb.org/${contentType}/${movieId}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Globe className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Official</span>
              <span className="sm:hidden">Web</span>
            </a>
          </Button>
        </div>
      </div>

      <LiveWatchModal
        open={isLiveWatchOpen}
        onClose={() => setIsLiveWatchOpen(false)}
        id={movieId.toString()}
        type={contentType}
        title={title}
        content={{
          id: movieId,
          title: title,
          media_type: contentType,
          name: title,
          imdb_id: imdbId
        } as any}
      />

      {/* Download modal for both movies and TV series */}
      <DownloadModal
        open={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        tmdbId={movieId.toString()}
        title={title}
        contentType={contentType}
        imdbId={imdbId}
      />
    </>
  );
};
