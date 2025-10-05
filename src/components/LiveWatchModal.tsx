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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.9)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          background: "#000",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        <LiveWatchModalHeader 
          onClose={onClose}
          title={title}
          hasSeasons={type === 'tv'}
          content={content}
        />
        
        <div style={{ paddingTop: '70px', height: '100%' }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            allow="autoplay; fullscreen"
            allowFullScreen
            frameBorder={0}
            title="Watch Now"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveWatchModal;
