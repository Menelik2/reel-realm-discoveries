
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, ArrowLeft } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

interface LiveWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  contentType: 'movie' | 'tv';
  title: string;
}

export const LiveWatchModal = ({ isOpen, onClose, movieId, contentType, title }: LiveWatchModalProps) => {
  const [showPlayer, setShowPlayer] = useState(false);

  // Handle escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset player state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPlayer(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden animate-fade-in duration-300">
      {/* Header with close button */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={onClose}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-lg font-semibold truncate">
              Watch: {title}
            </h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-accent lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="pt-16 h-full w-full flex flex-col">
        {!showPlayer ? (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-background to-secondary">
            <div className="text-center max-w-md mx-auto px-4 animate-fade-in duration-500">
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute h-full w-full bg-primary/20 rounded-full animate-pulse"></div>
                <Play className="h-16 w-16 text-primary z-10" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">Ready to Watch?</h2>
              <p className="text-muted-foreground mb-8">
                Click the button below to start streaming {title} instantly.
              </p>
              <Button onClick={() => setShowPlayer(true)} size="lg" className="w-full sm:w-auto animate-pulse">
                <Play className="mr-2 h-4 w-4" />
                Start Watching
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center p-4 md:p-8">
            <VideoEmbed
              tmdbId={movieId}
              type={contentType}
              title={title}
            />
          </div>
        )}
      </div>
    </div>
  );
};
