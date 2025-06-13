
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Watch: {title}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-4 pt-2">
          {!isPlayerLoaded ? (
            <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg">
              <Play className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ready to Watch</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Click below to start watching {title}
              </p>
              <Button onClick={handleLoadPlayer} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Watching
              </Button>
            </div>
          ) : (
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title={`Watch ${title}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
