import React from "react";
import { LiveWatchModalHeader } from '@/components/live-watch-modal/LiveWatchModalHeader';
import type { Movie } from '@/types/tmdb';

interface LiveWatchModalProps {
  open: boolean;
  onClose: () => void;
  id: string; // TMDB/IMDB ID (e.g., "tt1234567" or "12345")
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
  if (!open) return null;

  const embedUrl = `https://vidsrc.net/embed/${type}/${id}`;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex flex-col bg-black overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <LiveWatchModalHeader 
          onClose={onClose}
          title={title}
          hasSeasons={type === 'tv'}
          content={content}
        />
        
        <div className="flex-1 w-full h-full">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Watch Now"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

export default LiveWatchModal;
