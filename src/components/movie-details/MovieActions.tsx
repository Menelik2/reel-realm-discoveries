import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Heart, Globe, Download, Eye, Send, Share2 } from 'lucide-react';
import LiveWatchModal from '@/components/LiveWatchModal';
import DownloadModal from '@/components/DownloadModal';
import { useTelegramUrl } from '@/hooks/useTelegramUrl';
import { toast } from 'sonner';
import { trackEvent } from '@/utils/analytics';

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

  const handleTelegramDownload = () => {
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
      }
    } else {
      trackEvent('share_unsupported', baseProps);
    }

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

  const phonoFilmBrowseUrl = imdbId
    ? `https://phonofilm.net/search?q=${encodeURIComponent(imdbId)}`
    : `https://phonofilm.net/search?q=${encodeURIComponent(title)}`;

  const secondaryBtn =
    'rounded-full h-10 px-4 border-border/50 bg-secondary/40 hover:bg-secondary/70 shadow-sm';

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => setIsLiveWatchOpen(true)}
          size="lg"
          className="w-full rounded-2xl h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Eye className="mr-2.5 h-5 w-5" />
          Watch Now
        </Button>

        <div className="flex flex-wrap gap-2">
          {trailerUrl && (
            <Button asChild variant="outline" className={`flex-1 sm:flex-none ${secondaryBtn}`}>
              <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-4 w-4" />
                Trailer
              </a>
            </Button>
          )}

          <Button variant="outline" className={`flex-1 sm:flex-none ${secondaryBtn}`}>
            <Heart className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Favorite</span>
            <span className="sm:hidden">Like</span>
          </Button>

          <Button
            variant="outline"
            className={`flex-1 sm:flex-none ${secondaryBtn}`}
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>

          {contentType === 'tv' && (
            <Button
              variant="outline"
              className={`flex-1 sm:flex-none ${secondaryBtn}`}
              onClick={handleTelegramDownload}
              title={telegramUrl ? 'Browse series seasons & Fast Download' : 'Fetch series download links'}
            >
              <Send className="mr-2 h-4 w-4" />
              Telegram
            </Button>
          )}

          {contentType === 'tv' && (
            <Button variant="outline" asChild className={`flex-1 sm:flex-none ${secondaryBtn}`}>
              <a
                href={phonoFilmBrowseUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Browse files on PhonoFilm"
              >
                <Globe className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">PhonoFilm</span>
                <span className="sm:hidden">Browse</span>
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            className={`flex-1 sm:flex-none ${secondaryBtn}`}
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          <Button variant="outline" asChild className={`flex-1 sm:flex-none ${secondaryBtn}`}>
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
