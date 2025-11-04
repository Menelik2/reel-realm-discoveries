import React, { useState, useEffect } from "react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-request fullscreen when modal opens
  useEffect(() => {
    if (open && containerRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const elem = containerRef.current;
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
          } else if ((elem as any).webkitRequestFullscreen) {
            (elem as any).webkitRequestFullscreen();
          } else if ((elem as any).mozRequestFullScreen) {
            (elem as any).mozRequestFullScreen();
          }
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Escape - Exit fullscreen or close modal
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
      
      // F - Toggle fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (containerRef.current) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            const elem = containerRef.current;
            if (elem.requestFullscreen) {
              elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
            } else if ((elem as any).webkitRequestFullscreen) {
              (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).mozRequestFullScreen) {
              (elem as any).mozRequestFullScreen();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, onClose]);

  if (!open) return null;

  const embedUrl = `https://vidsrc.net/embed/${type}/${id}`;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full flex flex-col bg-black overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {!isFullscreen && (
          <LiveWatchModalHeader 
            onClose={onClose}
            title={title}
            hasSeasons={type === 'tv'}
            content={content}
          />
        )}
        
        <div className="flex-1 w-full h-full">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            title="Watch Now"
          />
        </div>
      </div>
    </div>
  );
};

export default LiveWatchModal;
