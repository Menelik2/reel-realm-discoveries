import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Heart, Globe, Download, Eye, Send, Share2 } from 'lucide-react';
import LiveWatchModal from '@/components/LiveWatchModal';
import DownloadModal from '@/components/DownloadModal';
import { useTelegramUrl } from '@/hooks/useTelegramUrl';
import { toast } from 'sonner';
import { trackEvent } from '@/utils/analytics';

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
    const shareUrl = `${window.location.origin}/${contentType}/${movieId}`;
    const shareData = {
      title,
      text: `Watch ${title} on YENI MOVIE`,
      url: shareUrl,
    };

    const baseProps = {
      contentType,
      contentId: movieId,
      title,
      url: shareUrl,
    };

    // Try native Web Share API on any device that supports it
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (!navigator.canShare || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          trackEvent('share_native_success', { ...baseProps, method: 'native' });
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          trackEvent('share_native_cancelled', { ...baseProps, method: 'native' });
          return;
        }
        // otherwise fall through to clipboard
      }
    } else {
      trackEvent('share_unsupported', baseProps);
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackEvent('share_clipboard_success', { ...baseProps, method: 'clipboard' });
      toast.success('Link copied to clipboard!', {
        description: shareUrl,
        duration: 8000,
        action: {
          label: 'Open link',
          onClick: () => window.open(shareUrl, '_blank', 'noopener,noreferrer'),
        },
      });
    } catch (err: any) {
      trackEvent('share_clipboard_failed', {
        ...baseProps,
        method: 'clipboard',
        error: err?.message ?? String(err),
      });
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Primary action - Live Watch */}
        <Button 
          onClick={() => setIsLiveWatchOpen(true)}
          size="lg"
          className="w-full bg-[hsl(348,83%,55%)] hover:bg-[hsl(348,83%,48%)] text-white rounded-xl py-6 text-lg font-bold shadow-lg shadow-[hsl(348,83%,55%)]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Eye className="mr-3 h-5 w-5" />
          Watch Now
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
          imdb_id: imdbId,
          seasons: seasons,
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
