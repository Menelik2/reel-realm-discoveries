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
import {
  activateAdInjectionGuard,
  deactivateAdInjectionGuard,
} from '@/utils/adInjectionGuard';

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

/** 0 = locked, 1 = first tap done, 2 = unlocked */
type ShieldStep = 0 | 1 | 2;

const LiveWatchModal: React.FC<LiveWatchModalProps> = ({
  open,
  onClose,
  id,
  type,
  title = "Watch Now",
  content,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shieldStep, setShieldStep] = useState<ShieldStep>(0);
  const [selectedSource, setSelectedSource] = useState(SOURCES[0].url);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    activateAdInjectionGuard();
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('data-video-modal-open', 'true');
    return () => {
      deactivateAdInjectionGuard();
      document.body.style.overflow = '';
      document.body.removeAttribute('data-video-modal-open');
    };
  }, [open]);

  const resetShield = useCallback(() => setShieldStep(0), []);

  const handleShieldTap = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShieldStep((prev) => {
      if (prev <= 0) return 1;
      if (prev === 1) return 2;
      return 2;
    });
  }, []);

  useEffect(() => {
    if (open) {
      resetShield();
      setSelectedSource(SOURCES[0].url);
      if (type === "tv" && seasons.length > 0) {
        setSelectedSeason(seasons[0].season_number);
        setSelectedEpisode(1);
      }
    }
  }, [open, type, seasons, resetShield]);

  useEffect(() => {
    if (!open) return;
    resetShield();
  }, [selectedSeason, selectedEpisode, selectedSource, open, resetShield]);

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
  const isUnlocked = shieldStep >= 2;
  const showClickShield = !isUnlocked;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      data-video-player-root="true"
    >
      <div
        ref={containerRef}
        className="relative flex flex-col w-full h-full max-w-[100vw] max-h-[100vh] bg-black"
        data-video-player-root="true"
      >
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
                      resetShield();
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
                      resetShield();
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

        <div className="flex-1 w-full relative min-h-0 bg-black isolate">
          {/* iframe cannot receive taps until unlocked */}
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            title={title}
            tabIndex={isUnlocked ? 0 : -1}
            style={{
              border: 'none',
              zIndex: 1,
              pointerEvents: isUnlocked ? 'auto' : 'none',
            }}
          />

          {showClickShield && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/80 backdrop-blur-sm select-none touch-manipulation"
              style={{ zIndex: 30 }}
              onClick={handleShieldTap}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShieldTap(e);
              }}
              onContextMenu={(e) => e.preventDefault()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleShieldTap(e);
              }}
              aria-label={shieldStep === 0 ? "Tap once to continue" : "Tap again to play"}
            >
              <div className="flex flex-col items-center gap-3 text-white pointer-events-none px-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {shieldStep === 0 ? (
                  <>
                    <p className="text-lg font-semibold">Tap to unlock</p>
                    <p className="text-xs text-white/70">Step 1 of 2 — video locked</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold animate-pulse">Tap again to play</p>
                    <p className="text-xs text-white/70">Step 2 of 2 — unlocks play button</p>
                  </>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="absolute flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full px-3 py-2 backdrop-blur-sm transition-colors border border-white/20 shadow-lg"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: '12px', zIndex: 40 }}
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium max-w-[140px] truncate hidden sm:inline">{title}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 backdrop-blur-sm transition-colors border border-white/10 shadow-lg"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', right: '12px', zIndex: 40 }}
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
