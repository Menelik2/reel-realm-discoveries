
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, ArrowLeft } from 'lucide-react';

interface LiveWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  contentType: 'movie' | 'tv';
  title: string;
}

export const LiveWatchModal = ({ isOpen, onClose, movieId, contentType, title }: LiveWatchModalProps) => {
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);

  const getEmbedUrl = () => {
    const baseUrl = `https://vidsrc.xyz/embed/${contentType}`;
    return `${baseUrl}?tmdb=${movieId}&autoplay=1`;
  };

  const handleLoadPlayer = () => {
    setIsPlayerLoaded(true);
  };

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
      setIsPlayerLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
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
      <div className="pt-16 h-full w-full">
        {!isPlayerLoaded ? (
          <div className="flex flex-col items-center justify-center h-full bg-muted/20">
            <div className="text-center max-w-md mx-auto px-4">
              <Play className="h-16 w-16 mb-4 text-primary mx-auto" />
              <h2 className="text-xl font-semibold mb-2">Ready to Watch</h2>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Click below to start watching {title}
              </p>
              <Button onClick={handleLoadPlayer} size="lg" className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Start Watching
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            title={`Watch ${title}`}
            style={{ border: 'none' }}
          />
        )}
      </div>
    </div>
  );
};
