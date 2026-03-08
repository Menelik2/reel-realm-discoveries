import React, { useState, useEffect, useCallback } from "react";
import { LiveWatchModalHeader } from '@/components/live-watch-modal/LiveWatchModalHeader';
import type { Movie } from '@/types/tmdb';
import { Button } from '@/components/ui/button';

const SOURCES = [
  { name: 'VidSrc NET', url: 'https://vidsrc.net' },
  { name: 'VidSrc XYZ', url: 'https://vidsrc.xyz' },
  { name: 'VidSrc ME', url: 'https://vidsrc.me' },
  { name: 'VidSrc PRO', url: 'https://vidsrc.pro' },
];

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
  const [selectedSource, setSelectedSource] = useState(SOURCES[0].url);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Block popups globally while modal is open
  useEffect(() => {
    if (!open) return;

    const originalOpen = window.open;
    window.open = function (...args: any[]) {
      console.log('Blocked popup:', args[0]);
      return null;
    };

    document.body.style.overflow = 'hidden';

    return () => {
      window.open = originalOpen;
      document.body.style.overflow = '';
    };
  }, [open]);

  // Click shield: absorbs first click (ad trigger), then reveals iframe
  const handleShieldClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowClickShield(false);
  }, []);

  // Reset shield when modal opens
  useEffect(() => {
    if (open) {
      setShowClickShield(true);
      setSelectedSource(SOURCES[0].url);
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

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress, true);
    return () => window.removeEventListener('keydown', handleKeyPress, true);
  }, [open, onClose, toggleFullscreen]);

  const handleSourceChange = useCallback((url: string) => {
    setSelectedSource(url);
    setShowClickShield(true);
  }, []);

  if (!open) return null;

  const contentId = (content as any)?.imdb_id || id;
  const embedUrl = `${selectedSource}/embed/${type}/${contentId}`;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full flex flex-col bg-black overflow-hidden"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        {!isFullscreen && (
          <LiveWatchModalHeader 
            onClose={onClose}
            title={title}
            hasSeasons={type === 'tv'}
            content={content}
          />
        )}

        {/* Source selector */}
        {!isFullscreen && (
          <div className="flex items-center gap-2 px-3 py-2 bg-black/80 border-b border-white/10 overflow-x-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Source:</span>
            {SOURCES.map(source => (
              <Button
                key={source.url}
                variant={selectedSource === source.url ? 'default' : 'secondary'}
                size="sm"
                className="text-xs h-7 px-3 whitespace-nowrap"
                onClick={(e) => { e.stopPropagation(); handleSourceChange(source.url); }}
              >
                {source.name}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex-1 w-full h-full relative">
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            title="Watch Now"
            style={{ border: 'none' }}
          />
          
          {/* Click shield - absorbs initial ad-triggering click */}
          {showClickShield && (
            <div 
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={handleShieldClick}
              onMouseDown={e => e.stopPropagation()}
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

        {/* Fullscreen toggle button */}
        {!isFullscreen && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="absolute bottom-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 backdrop-blur-sm transition-colors"
            title="Toggle Fullscreen (F)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveWatchModal;
