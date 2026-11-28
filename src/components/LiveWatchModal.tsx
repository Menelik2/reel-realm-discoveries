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
import { Maximize2, Minimize2, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { getEmbedUrl, EMBED_SOURCES } from '@/utils/videoEmbedUtils';
import CustomVideoPlayer from '@/components/CustomVideoPlayer';
import {
  activateAdInjectionGuard,
  deactivateAdInjectionGuard,
} from '@/utils/adInjectionGuard';

const PROVIDER_LOAD_TIMEOUT_MS = 12_000;

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
  videoUrl?: string;
}

const LiveWatchModal: React.FC<LiveWatchModalProps> = ({
  open,
  onClose,
  id,
  type,
  title = 'Watch Now',
  content,
  videoUrl,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failedSources, setFailedSources] = useState<Set<string>>(() => new Set());
  const [providerLoaded, setProviderLoaded] = useState(false);
  const [allFailed, setAllFailed] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const providerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceIndexRef = useRef(0);
  const loadedRef = useRef(false);

  const seasons = useMemo(() => {
    const raw = content?.seasons;
    return Array.isArray(raw)
      ? raw.filter((season) => season.season_number > 0 && season.episode_count > 0)
      : [];
  }, [content]);

  const currentSeason = seasons.find((season) => season.season_number === selectedSeason);
  const episodeCount = currentSeason?.episode_count ?? 1;

  const selectedSource = EMBED_SOURCES[sourceIndex]?.url || EMBED_SOURCES[0]?.url || '';

  useEffect(() => {
    sourceIndexRef.current = sourceIndex;
  }, [sourceIndex]);

  const numericId = Number(id);
  const isNumeric = Number.isSafeInteger(numericId) && numericId > 0 && String(numericId) === id;

  const embedUrl = useMemo(
    () =>
      getEmbedUrl({
        tmdbId: isNumeric ? numericId : undefined,
        imdbId: isNumeric ? undefined : id,
        type,
        season: type === 'tv' ? selectedSeason : undefined,
        episode: type === 'tv' ? selectedEpisode : undefined,
        source: selectedSource,
      }),
    [id, isNumeric, numericId, type, selectedSeason, selectedEpisode, selectedSource],
  );

  const clearProviderTimer = useCallback(() => {
    if (providerTimerRef.current) {
      clearTimeout(providerTimerRef.current);
      providerTimerRef.current = null;
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
          nextIdx === -1 ? EMBED_SOURCES.findIndex((s) => !next.has(s.url)) : nextIdx;

        if (wrapIdx === -1 || EMBED_SOURCES.length === 0) {
          setAllFailed(true);
          setIsSwitching(false);
          return next;
        }

        setIsSwitching(true);
        setAllFailed(false);
        setProviderLoaded(false);
        loadedRef.current = false;
        setSourceIndex(wrapIdx);
        setRetryKey((k) => k + 1);
        return next;
      });
    },
    [],
  );

  const startWatchdog = useCallback(
    (sourceUrl: string) => {
      clearProviderTimer();
      loadedRef.current = false;
      setProviderLoaded(false);

      if (!sourceUrl) return;

      providerTimerRef.current = setTimeout(() => {
        if (loadedRef.current) return;
        console.warn('[LiveWatch] provider timeout, failing over from', sourceUrl);
        tryNextSource(sourceUrl);
      }, PROVIDER_LOAD_TIMEOUT_MS);
    },
    [clearProviderTimer, tryNextSource],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    activateAdInjectionGuard();
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('data-video-modal-open', 'true');

    return () => {
      deactivateAdInjectionGuard();
      document.body.style.overflow = previousOverflow;
      document.body.removeAttribute('data-video-modal-open');
      clearProviderTimer();
    };
  }, [open, clearProviderTimer]);

  useEffect(() => {
    if (!open) return;
    setSourceIndex(0);
    setFailedSources(new Set());
    setAllFailed(false);
    setIsSwitching(false);
    setProviderLoaded(false);
    loadedRef.current = false;
    setSelectedSeason(seasons[0]?.season_number ?? 1);
    setSelectedEpisode(1);
    setRetryKey((k) => k + 1);
  }, [open, id, type, seasons]);

  useEffect(() => {
    if (!open || videoUrl || !selectedSource) return;
    startWatchdog(selectedSource);
    return clearProviderTimer;
  }, [open, selectedSource, selectedSeason, selectedEpisode, retryKey, videoUrl, startWatchdog, clearProviderTimer]);

  const toggleFullscreen = useCallback(async () => {
    const element = containerRef.current;
    if (!element) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        return;
      }
      if (typeof element.requestFullscreen === 'function') {
        await element.requestFullscreen();
        return;
      }
      const video = element.querySelector('video') as
        | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
        | null;
      video?.webkitEnterFullscreen?.();
    } catch {
      // Fullscreen may be unavailable
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'f' || event.key === 'F') && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        void toggleFullscreen();
      }
      if (event.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, toggleFullscreen, onClose]);

  const handleBack = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen?.();
      } catch {
        // ignore
      }
    }
    onClose();
  }, [onClose]);

  const handleProviderLoad = useCallback(() => {
    loadedRef.current = true;
    clearProviderTimer();
    setProviderLoaded(true);
    setIsSwitching(false);
    setAllFailed(false);
  }, [clearProviderTimer]);

  const handleProviderError = useCallback(() => {
    tryNextSource(selectedSource);
  }, [selectedSource, tryNextSource]);

  const selectSourceManual = useCallback((url: string) => {
    const idx = EMBED_SOURCES.findIndex((s) => s.url === url);
    if (idx < 0) return;
    setFailedSources((prev) => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
    setAllFailed(false);
    setIsSwitching(false);
    setProviderLoaded(false);
    loadedRef.current = false;
    setSourceIndex(idx);
    setRetryKey((k) => k + 1);
  }, []);

  const retryAll = useCallback(() => {
    setFailedSources(new Set());
    setAllFailed(false);
    setIsSwitching(false);
    setProviderLoaded(false);
    loadedRef.current = false;
    setSourceIndex(0);
    setRetryKey((k) => k + 1);
  }, []);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden overscroll-none bg-black"
      data-video-player-root="true"
    >
      <div
        ref={containerRef}
        className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] min-h-0 flex-col overflow-hidden bg-black"
        data-video-player-root="true"
      >
        <div className="z-20 flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-black/90 px-[max(12px,env(safe-area-inset-left))] pb-2 pr-[max(12px,env(safe-area-inset-right))] pt-[calc(env(safe-area-inset-top)+8px)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => void handleBack()}
            className="flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-3 text-sm text-white hover:bg-white/20"
            aria-label="Close player"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="max-w-[140px] truncate">{title}</span>
          </button>

          {EMBED_SOURCES.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {EMBED_SOURCES.map((source) => {
                const failed = failedSources.has(source.url);
                const active = selectedSource === source.url;
                return (
                  <Button
                    key={source.url}
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 rounded-full ${failed ? 'opacity-50' : ''}`}
                    onClick={() => selectSourceManual(source.url)}
                    title={failed ? 'Timed out — click to retry' : source.url}
                  >
                    {source.name}
                  </Button>
                );
              })}
            </div>
          )}

          {type === 'tv' && seasons.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Select
                value={String(selectedSeason)}
                onValueChange={(value) => {
                  setSelectedSeason(Number(value));
                  setSelectedEpisode(1);
                  setFailedSources(new Set());
                  setSourceIndex(0);
                  setRetryKey((k) => k + 1);
                }}
              >
                <SelectTrigger className="h-11 w-[105px] rounded-full border-white/15 bg-white/10 text-xs text-white">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-64">
                  {seasons.map((season) => (
                    <SelectItem key={season.season_number} value={String(season.season_number)}>
                      {season.name || `Season ${season.season_number}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(selectedEpisode)}
                onValueChange={(value) => {
                  setSelectedEpisode(Number(value));
                  setFailedSources(new Set());
                  setSourceIndex(0);
                  setRetryKey((k) => k + 1);
                }}
              >
                <SelectTrigger className="h-11 w-[100px] rounded-full border-white/15 bg-white/10 text-xs text-white">
                  <SelectValue placeholder="Episode" />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-64">
                  {Array.from({ length: episodeCount }, (_, index) => index + 1).map((episode) => (
                    <SelectItem key={episode} value={String(episode)}>
                      Episode {episode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
          {videoUrl ? (
            <div className="flex h-full w-full items-center justify-center">
              <CustomVideoPlayer src={videoUrl} title={title} />
            </div>
          ) : embedUrl ? (
            <>
              <iframe
                key={`${embedUrl}-${retryKey}`}
                src={embedUrl}
                className="h-full w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer"
                title={`Watch ${title}`}
                loading="eager"
                onLoad={handleProviderLoad}
                onError={handleProviderError}
              />
              {!providerLoaded && !allFailed && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white/75">
                  {isSwitching ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Trying another server…
                    </span>
                  ) : (
                    'Connecting…'
                  )}
                </div>
              )}
              {allFailed && (
                <div
                  role="alert"
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/95 px-6 text-center text-white"
                >
                  <p className="font-semibold">All servers timed out</p>
                  <p className="max-w-md text-sm text-white/65">
                    Streams can be blocked by network or region. Try another source button above, or
                    retry.
                  </p>
                  <Button onClick={retryAll} variant="secondary" className="gap-2 rounded-full">
                    <RefreshCw className="h-4 w-4" /> Retry all servers
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
              <p className="text-lg font-semibold">Unable to build player URL</p>
              <p className="max-w-lg text-sm text-white/65">
                Missing TMDB/IMDb id for this title. Open the title from the catalogue and try again.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] right-[max(16px,env(safe-area-inset-right))] z-40 flex min-h-12 min-w-12 items-center justify-center rounded-full border border-white/15 bg-black/75 p-3 text-white shadow-lg backdrop-blur-md hover:bg-black"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
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
