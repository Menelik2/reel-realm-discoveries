import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { LiveWatchModalHeader } from '@/components/live-watch-modal/LiveWatchModalHeader';
import type { Movie } from '@/types/tmdb';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Maximize2 } from 'lucide-react';

const SOURCES = [
  { name: 'VidSrc SBS', url: 'https://vidsrc.sbs' },
];

interface SeasonLite {
  id?: number;
  name?: string;
  season_number: number;
  episode_count: number;
}

interface LiveWatchModalProps {
  open: boolean;
  onClose: () => void;
  id: string;
  type: "movie" | "tv";
  title?: string;
  content?: Movie & { seasons?: SeasonLite[] };
}

const LiveWatchModal: React.FC<LiveWatchModalProps> = ({
  open,
  onClose,
  id,
  type,
  title = "Watch Now",
  content,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showClickShield, setShowClickShield] = useState(true);
  const [selectedSource, setSelectedSource] = useState(SOURCES[0].url);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Season/episode state (TV only)
  const seasons: SeasonLite[] = useMemo(() => {
    const raw = (content as any)?.seasons as SeasonLite[] | undefined;
    return Array.isArray(raw) ? raw.filter(s => s.season_number > 0 && s.episode_count > 0) : [];
  }, [content]);

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);

  const currentSeason = useMemo(
    () => seasons.find(s => s.season_number === selectedSeason),
    [seasons, selectedSeason]
  );
  const episodeCount = currentSeason?.episode_count ?? 1;

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

  const handleShieldClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowClickShield(false);
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) {
      setShowClickShield(true);
      setSelectedSource(SOURCES[0].url);
      if (type === 'tv') {
        const first = seasons[0];
        setSelectedSeason(first?.season_number ?? 1);
        setSelectedEpisode(1);
      }
    }
  }, [open, type, seasons]);

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

  const handleSeasonChange = useCallback((val: string) => {
    setSelectedSeason(Number(val));
    setSelectedEpisode(1);
    setShowClickShield(true);
  }, []);

  const handleEpisodeChange = useCallback((val: string) => {
    setSelectedEpisode(Number(val));
    setShowClickShield(true);
  }, []);

  if (!open) return null;

  const contentId = (content as any)?.imdb_id || id;
  const embedUrl =
    type === 'tv'
      ? `${selectedSource}/embed/tv/${contentId}/${selectedSeason}/${selectedEpisode}`
      : `${selectedSource}/embed/movie/${contentId}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black overscroll-contain"
      style={{ height: '100dvh' }}
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
            selectedSeasonNumber={type === 'tv' ? selectedSeason : undefined}
            selectedEpisodeNumber={type === 'tv' ? selectedEpisode : undefined}
            content={content}
          />
        )}

        {/* Source + Season/Episode selectors */}
        {!isFullscreen && (
          <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 bg-background/95 border-b border-border">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Source:</span>
              {SOURCES.map(source => (
                <Button
                  key={source.url}
                  variant={selectedSource === source.url ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7 px-3 whitespace-nowrap flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); handleSourceChange(source.url); }}
                >
                  {source.name}
                </Button>
              ))}
            </div>

            {type === 'tv' && seasons.length > 0 && (
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Season</span>
                  <Select value={String(selectedSeason)} onValueChange={handleSeasonChange}>
                    <SelectTrigger
                      className="h-7 min-w-[6rem] text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] max-h-64">
                      {seasons.map(s => (
                        <SelectItem key={s.season_number} value={String(s.season_number)}>
                          {s.name || `Season ${s.season_number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Episode</span>
                  <Select value={String(selectedEpisode)} onValueChange={handleEpisodeChange}>
                    <SelectTrigger
                      className="h-7 min-w-[5rem] text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] max-h-64">
                      {Array.from({ length: episodeCount }, (_, i) => i + 1).map(ep => (
                        <SelectItem key={ep} value={String(ep)}>
                          Ep {ep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 w-full relative min-h-0">
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

          {/* Fullscreen toggle — inside iframe area, above safe area, never clipped by bottom nav */}
          {!isFullscreen && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="absolute right-3 z-20 bg-black/60 hover:bg-black/80 text-white rounded-lg p-2 backdrop-blur-sm transition-colors border border-white/10"
              style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
              title="Toggle Fullscreen (F)"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LiveWatchModal;
