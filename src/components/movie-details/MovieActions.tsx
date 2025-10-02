import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Heart, Globe, Download, Eye, Send, Copy, Check } from 'lucide-react';
import LiveWatchModal from '@/components/LiveWatchModal';
import DownloadModal from '@/components/DownloadModal';
import { useTelegramUrl } from '@/hooks/useTelegramUrl';
import { fetchTylerMoviesDirectLink, DirectDownload } from '@/api/downloadService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [directDownloadData, setDirectDownloadData] = useState<DirectDownload | null>(null);
  const [showDirectDownloadDialog, setShowDirectDownloadDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  
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

  const handleDirectDownload = async () => {
    if (contentType !== 'movie') {
      toast.error('Direct download is only available for movies');
      return;
    }

    setIsDownloading(true);
    const loadingToast = toast.loading('Fetching download link from Tyler Movies Empire...');

    try {
      const directLink = await fetchTylerMoviesDirectLink(movieId.toString());
      
      toast.dismiss(loadingToast);
      
      if (directLink) {
        setDirectDownloadData(directLink);
        setShowDirectDownloadDialog(true);
        toast.success('Download link generated successfully!');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Direct download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get download link';
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!directDownloadData) return;
    
    try {
      await navigator.clipboard.writeText(directDownloadData.url);
      setCopied(true);
      toast.success('Download URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleOpenDownload = () => {
    if (!directDownloadData) return;
    window.open(directDownloadData.url, '_blank');
    toast.success('Opening download link...');
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
          
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={handleDirectDownload}
            disabled={isDownloading || contentType !== 'movie'}
          >
            <Heart className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{isDownloading ? 'Getting Link...' : 'Direct Download'}</span>
            <span className="sm:hidden">{isDownloading ? 'Wait...' : 'Direct'}</span>
          </Button>
          
          {/* Download button for both movies and TV series */}
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Save</span>
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
              <span className="sm:hidden">TG</span>
            </Button>
          )}
          
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

      {/* Direct Download Dialog */}
      <Dialog open={showDirectDownloadDialog} onOpenChange={setShowDirectDownloadDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Direct Download Link Generated</DialogTitle>
            <DialogDescription>
              720p quality from Tyler Movies Empire
            </DialogDescription>
          </DialogHeader>
          
          {directDownloadData && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Filename</p>
                    <p className="text-sm font-mono break-all">{directDownloadData.filename}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quality</p>
                    <p className="text-sm font-semibold">{directDownloadData.quality}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Size</p>
                    <p className="text-sm font-semibold">{directDownloadData.size}</p>
                  </div>
                </div>
              </div>

              {/* Download URL */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Download URL</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-md p-3 overflow-x-auto">
                    <code className="text-xs break-all">{directDownloadData.url}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleOpenDownload} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Start Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDirectDownloadDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
