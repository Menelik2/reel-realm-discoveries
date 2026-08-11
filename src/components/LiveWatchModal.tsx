import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import type { Movie } from '@/types/tmdb';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { getEmbedUrl } from '@/utils/videoEmbedUtils';

const SOURCES = [
  { name: 'VidSrc TW', url: 'https://vidsrc.tw' },
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
      if (type === "tv" && seasons.length > 0) {
        setSelectedSeason(seasons[0].season_number);
        setSelectedEpisode(1);
      }
    }
  }, [open, type, seasons]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard shortcut for fullscreen + Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggleFullscreen, onClose]);

  const handleBack = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {}).then(() => onClose());
    } else {
      onClose();
    }
  }, [onClose]);

  const numericId = Number(id);
  const isNumeric = !Number.isNaN(numericId) && String(numericId) === String(id);

  const embedUrl = getEmbedUrl({
    tmdbId: isNumeric ? numericId : undefined,
    imdbId: !isNumeric ? id : undefined,
    type,
    season: type === "tv" ? selectedSeason : undefined,
    episode: type === "tv" ? selectedEpisode : undefined,
    source: selectedSource,
  }) || "";

  if (!open) return null;

  const showControlsBar = (type === "tv" && seasons.length > 0) || SOURCES.length > 1;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div
        ref={containerRef}
        className="relative flex flex-col w-full h-full max-w-[100vw] max-h-[100vh] bg-black"
      >
        {/* Season / episode controls (TV only) – compact dark bar */}
        {showControlsBar && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-black/80 border-b border-white/10 flex-shrink-0 z-20">
            {SOURCES.length > 1 && (
              <div className="flex gap-1">
                {SOURCES.map(source => (
                  <Button
                    key={source.url}
                    variant={selectedSource === source.url ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSource(source.url)}
                  >
                    {source.name}
                  </Button>
                ))}
              </div>
            )}

            {type === "tv" && seasons.length > 0 && (
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground hidden sm:inline">Season</span>
                  <Select
                    value={String(selectedSeason)}
                    onValueChange={(v) => {
                      setSelectedSeason(Number(v));
                      setSelectedEpisode(1);
                      setShowClickShield(true);
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-8 text-xs bg-black/50 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] max-h-64">
                      {seasons.map(s => (
                        <SelectItem key={s.season_number} value={String(s.season_number)}>
                          {s.name || `S${s.season_number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground hidden sm:inline">Episode</span>
                  <Select
                    value={String(selectedEpisode)}
                    onValueChange={(v) => {
                      setSelectedEpisode(Number(v));
                      setShowClickShield(true);
                    }}
                  >
                    <SelectTrigger className="w-[90px] h-8 text-xs bg-black/50 border-white/20 text-white">
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

        {/* Video fills remaining space */}
        <div className="flex-1 w-full relative min-h-0 bg-black">
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            title={title}
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

          {/* Floating back button – top left */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="absolute z-40 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full px-3 py-2 backdrop-blur-sm transition-colors border border-white/20 shadow-lg"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: '12px' }}
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium max-w-[140px] truncate hidden sm:inline">{title}</span>
          </button>

          {/* Fullscreen toggle – bottom right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute z-40 bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 backdrop-blur-sm transition-colors border border-white/10 shadow-lg"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', right: '12px' }}
            title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Toggle fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LiveWatchModal;
