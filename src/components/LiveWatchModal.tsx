import React, { useState, useEffect, useCallback } from "react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showClickShield, setShowClickShield] = useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Block popups globally while modal is open
  useEffect(() => {
    if (!open) return;

    const originalOpen = window.open;
    window.open = function (...args: any[]) {
      console.log('Blocked popup:', args[0]);
      return null;
    };

    // Block beforeunload/unload navigation attempts
    const blockNavigation = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', blockNavigation);

    return () => {
      window.open = originalOpen;
      window.removeEventListener('beforeunload', blockNavigation);
    };
  }, [open]);

  // Click shield: absorbs first click (which is usually an ad trigger), then reveals iframe
  const handleShieldClick = useCallback(() => {
    setShowClickShield(false);
  }, []);

  // Reset shield when modal opens
  useEffect(() => {
    if (open) {
      setShowClickShield(true);
    }
  }, [open]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-request fullscreen when modal opens
  useEffect(() => {
    if (open && containerRef.current) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const elem = containerRef.current;
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
          } else if ((elem as any).webkitRequestFullscreen) {
            (elem as any).webkitRequestFullscreen();
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
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (containerRef.current) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            containerRef.current.requestFullscreen?.().catch(() => {});
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, onClose]);

  if (!open) return null;

  const contentId = (content as any)?.imdb_id || id;
  const embedUrl = `https://vidsrc.net/embed/${type}/${contentId}`;

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
        
        <div className="flex-1 w-full h-full relative">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            title="Watch Now"
            style={{ border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"
          />
          
          {/* Click shield - absorbs initial ad-triggering click */}
          {showClickShield && (
            <div 
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={handleShieldClick}
            >
              <div className="flex flex-col items-center gap-3 text-white animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <p className="text-lg font-semibold">Tap to Play</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveWatchModal;
