import React, { useState } from "react";
import { LiveWatchModalHeader } from '@/components/live-watch-modal/LiveWatchModalHeader';
import type { Movie } from '@/types/tmdb';

interface LiveWatchModalProps {
  open: boolean;
  onClose: () => void;
  id: string;
  type: "movie" | "tv";
  title?: string;
  content?: Movie;
}

const LiveWatchModal: React.FC<LiveWatchModalProps> = ({ 
  open, 
  onClose, 
  id, 
  type, 
  title = "Watch Now",
  content
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Close on escape key
  React.useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  // Use IMDB ID if available for better compatibility, otherwise use TMDB ID
  const contentId = (content as any)?.imdb_id || id;
  const embedUrl = `https://vidsrc.net/embed/${type}/${contentId}`;

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col">
      <LiveWatchModalHeader 
        onClose={onClose}
        title={title}
        hasSeasons={type === 'tv'}
        content={content}
      />
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          referrerPolicy="origin"
          title={title}
        />
      </div>
    </div>
  );
};

export default LiveWatchModal;
