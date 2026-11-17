import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Movie } from '@/types/tmdb';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Maximize2, Minimize2, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { getEmbedUrl, EMBED_SOURCES } from '@/utils/videoEmbedUtils';
import {
  activateAdInjectionGuard,
  deactivateAdInjectionGuard,
} from '@/utils/adInjectionGuard';

/** If the iframe never fires load, try the next mirror. */
const LOAD_TIMEOUT_MS = 10_000;

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
  type: 'movie' | 'tv';
  title?: string;
  content?: Movie & { seasons?: SeasonLite[] };
}

const LiveWatchModal: React.FC<LiveWatchModalProps> = ({
  open,
  onClose,
  id,
  type,
  title = 'Watch Now',
  content,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failedSources, setFailedSources] = useState<Set<string>>(() => new Set());
  const [isSwitching, setIsSwitching] = useState(false);
  const [loadFailedAll, setLoadFailedAll] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);
  const sourceIndexRef = useRef(0);

  const seasons: SeasonLite[] = useMemo(() => {
    const raw = (content as { seasons?: SeasonLite[] } | undefined)?.seasons;
    return Array.isArray(raw)
      ? raw.filter((s) => s.season_number > 0 && s.episode_count > 0)
      : [];
  }, [content]);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const currentSeason = useMemo(
    () => seasons.find((s) => s.season_number === selectedSeason),
    [seasons, selectedSeason],
  );
  const episodeCount = currentSeason?.episode_count ?? 1;

  const selectedSource = EMBED_SOURCES[sourceIndex]?.url || EMBED_SOURCES[0].url;

  useEffect(() => {
    sourceIndexRef.current = sourceIndex;
  }, [sourceIndex]);

  const clearLoadTimer = useCallback(() => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  }, []);

  const tryNextSource = useCallback(
    (fromUrl: string) => {
      setFailedSources((prev) => {
        const next = new Set(prev);
        next.add(fromUrl);

        const nextIdx = EMBED_SOURCES.findIndex(
          (s, i) => i > sourceIndexRef.current && !next.has(s.url),
        );
        const wrapIdx =
          nextIdx === -1
            ? EMBED_SOURCES.findIndex((s) => !next.has(s.url))
            : nextIdx;

        if (wrapIdx === -1) {
          setLoadFailedAll(true);
          setIsSwitching(false);
          return next;
        }

        setIsSwitching(true);
        setLoadFailedAll(false);
        setSourceIndex(wrapIdx);
        setIframeKey((k) => k + 1);
        return next;
      });
    },
    [],
  );

  const startLoadWatchdog = useCallback(
    (sourceUrl: string) => {
      clearLoadTimer();
      loadedRef.current = false;
      setIsSwitching(false);

      loadTimerRef.current = setTimeout(() => {
        if (loadedRef.current) return;
        console.warn('[LiveWatch] embed load timeout, failing over from', sourceUrl);
        tryNextSource(sourceUrl);
      }, LOAD_TIMEOUT_MS);
    },
    [clearLoadTimer, tryNextSource],
  );

  // Body lock + ad guard
  useEffect(() => {
    if (!open) return;
    activateAdInjectionGuard();
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('data-video-modal-open', 'true');
    return () => {
      deactivateAdInjectionGuard();
      document.body.style.overflow = '';
      document.body.removeAttribute('data-video-modal-open');
      clearLoadTimer();
    };
  }, [open, clearLoadTimer]);

  // Reset player state when modal opens or episode changes
  useEffect(() => {
    if (!open) return;
    setSourceIndex(0);
    setFailedSources(new Set());
    setLoadFailedAll(false);
    setIsSwitching(false);
    setIframeKey((k) => k + 1);
    if (type === 'tv' && seasons.length > 0) {
      setSelectedSeason(seasons[0].season_number);
      setSelectedEpisode(1);
    }
  }, [open, type, seasons, id]);

  // Restart watchdog whenever the active source / episode / key changes
  useEffect(() => {
    if (!open) return;
    startLoadWatchdog(selectedSource);
    return clearLoadTimer;
  }, [
    open,
    selectedSource,
    selectedSeason,
    selectedEpisode,
    iframeKey,
    startLoadWatchdog,
    clearLoadTimer,
  ]);

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
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggleFullscreen, onClose]);

  const handleBack = useCallback(() => {
    if (document.fullscreenElement) {
      document
        .exitFullscreen?.()
        .catch(() => {})
        .then(() => onClose());
    } else {
      onClose();
    }
  }, [onClose]);

  const handleIframeLoad = useCallback(() => {
    loadedRef.current = true;
    clearLoadTimer();
    setIsSwitching(false);
    setLoadFailedAll(false);
  }, [clearLoadTimer]);

  const handleIframeError = useCallback(() => {
    console.warn('[LiveWatch] iframe error, failing over from', selectedSource);
    tryNextSource(selectedSource);
  }, [selectedSource, tryNextSource]);

  const selectSourceManual = useCallback(
    (url: string) => {
      const idx = EMBED_SOURCES.findIndex((s) => s.url === url);
      if (idx < 0) return;
      setFailedSources((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
      setLoadFailedAll(false);
      setIsSwitching(false);
      setSourceIndex(idx);
      setIframeKey((k) => k + 1);
    },
    [],
  );

  const retryFromStart = useCallback(() => {
    setFailedSources(new Set());
    setLoadFailedAll(false);
    setSourceIndex(0);
    setIframeKey((k) => k + 1);
  }, []);

  const numericId = Number(id);
  const isNumeric = !Number.isNaN(numericId) && String(numericId) === String(id);

  const embedUrl =
    getEmbedUrl({
      tmdbId: isNumeric ? numericId : undefined,
      imdbId: !isNumeric ? id : undefined,
      type,
      season: type === 'tv' ? selectedSeason : undefined,
      episode: type === 'tv' ? selectedEpisode : undefined,
      source: selectedSource,
    }) || '';

  if (!open) return null;

  const showControlsBar = true;

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
          <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-black/90 backdrop-blur-md border-b border-white/10 flex-shrink-0 z-20">
            <div className="flex flex-wrap gap-1">
              {EMBED_SOURCES.map((source) => {
                const failed = failedSources.has(source.url);
                const active = selectedSource === source.url;
                return (
                  <Button
                    key={source.url}
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 ${failed ? 'opacity-50' : ''}`}
                    onClick={() => selectSourceManual(source.url)}
                    title={failed ? 'Previously timed out — click to retry' : source.url}
                  >
                    {source.name}
                  </Button>
                );
              })}
            </div>

            {type === 'tv' && seasons.length > 0 && (
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50 hidden sm:inline font-medium">Season</span>
                  <Select
                    value={String(selectedSeason)}
                    onValueChange={(v) => {
                      setSelectedSeason(Number(v));
                      setSelectedEpisode(1);
                      setFailedSources(new Set());
                      setSourceIndex(0);
                      setIframeKey((k) => k + 1);
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-8 text-xs rounded-full bg-white/10 border-white/15 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] max-h-64">
                      {seasons.map((s) => (
                        <SelectItem key={s.season_number} value={String(s.season_number)}>
                          {s.name || `S${s.season_number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50 hidden sm:inline font-medium">Episode</span>
                  <Select
                    value={String(selectedEpisode)}
                    onValueChange={(v) => {
                      setSelectedEpisode(Number(v));
                      setFailedSources(new Set());
                      setSourceIndex(0);
                      setIframeKey((k) => k + 1);
                    }}
                  >
                    <SelectTrigger className="w-[90px] h-8 text-xs rounded-full bg-white/10 border-white/15 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] max-h-64">
                      {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
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

        <div className="flex-1 w-full relative min-h-0 bg-black">
          {embedUrl ? (
            <iframe
              key={`${iframeKey}-${embedUrl}`}
              src={embedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer"
              title={title}
              style={{ border: 'none' }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/70 text-sm">
              No embed URL for this title
            </div>
          )}

          {isSwitching && !loadFailedAll && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-center pointer-events-none">
              <div className="flex items-center gap-2 rounded-full bg-black/80 border border-white/15 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                Trying another server…
              </div>
            </div>
          )}

          {loadFailedAll && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center">
              <p className="text-white font-medium">All servers timed out</p>
              <p className="text-sm text-white/60 max-w-sm">
                Streams can be blocked by network or region. Try another source button above, or
                retry.
              </p>
              <Button
                onClick={retryFromStart}
                className="rounded-full gap-2"
                variant="secondary"
              >
                <RefreshCw className="h-4 w-4" />
                Retry all servers
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="absolute z-40 flex items-center gap-1.5 bg-black/75 hover:bg-black/90 text-white rounded-full px-3.5 py-2 backdrop-blur-md transition-colors border border-white/15 shadow-lg"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: '12px' }}
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium max-w-[140px] truncate hidden sm:inline">
              {title}
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute z-40 bg-black/75 hover:bg-black/90 text-white rounded-full p-2.5 backdrop-blur-md transition-colors border border-white/15 shadow-lg"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
              right: '12px',
            }}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LiveWatchModal;
