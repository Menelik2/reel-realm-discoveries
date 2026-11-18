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
import { Maximize2, Minimize2, ArrowLeft, RefreshCw } from 'lucide-react';
import { getEmbedUrl } from '@/utils/videoEmbedUtils';
import {
  activateAdInjectionGuard,
  deactivateAdInjectionGuard,
} from '@/utils/adInjectionGuard';

const PROVIDER_LOAD_TIMEOUT_MS = 15_000;

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
  const [providerLoaded, setProviderLoaded] = useState(false);
  const [providerError, setProviderError] = useState(false);
  const [providerTimedOut, setProviderTimedOut] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const providerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seasons = useMemo(() => {
    const raw = content?.seasons;
    return Array.isArray(raw)
      ? raw.filter((season) => season.season_number > 0 && season.episode_count > 0)
      : [];
  }, [content]);

  const currentSeason = seasons.find((season) => season.season_number === selectedSeason);
  const episodeCount = currentSeason?.episode_count ?? 1;

  const numericId = Number(id);
  const isNumeric = Number.isSafeInteger(numericId) && numericId > 0 && String(numericId) === id;
  const embedUrl = useMemo(() => getEmbedUrl({
    tmdbId: isNumeric ? numericId : undefined,
    imdbId: isNumeric ? undefined : id,
    type,
    season: type === 'tv' ? selectedSeason : undefined,
    episode: type === 'tv' ? selectedEpisode : undefined,
  }), [id, isNumeric, numericId, type, selectedSeason, selectedEpisode]);

  const clearProviderTimer = useCallback(() => {
    if (providerTimerRef.current) {
      clearTimeout(providerTimerRef.current);
      providerTimerRef.current = null;
    }
  }, []);

  const resetProviderState = useCallback(() => {
    clearProviderTimer();
    setProviderLoaded(false);
    setProviderError(false);
    setProviderTimedOut(false);
  }, [clearProviderTimer]);

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
    setSelectedSeason(seasons[0]?.season_number ?? 1);
    setSelectedEpisode(1);
    resetProviderState();
  }, [open, id, type, seasons, resetProviderState]);

  useEffect(() => {
    if (!open || videoUrl || !embedUrl) return;
    resetProviderState();
    providerTimerRef.current = setTimeout(() => {
      setProviderTimedOut(true);
    }, PROVIDER_LOAD_TIMEOUT_MS);
    return clearProviderTimer;
  }, [open, embedUrl, videoUrl, resetProviderState, clearProviderTimer]);

  const toggleFullscreen = useCallback(async () => {
    const element = containerRef.current;
    if (!element) return;
    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      // Fullscreen may be unavailable in embedded browsers or denied by the OS.
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
        // Continue closing if fullscreen exit is unavailable.
      }
    }
    onClose();
  }, [onClose]);

  const handleProviderLoad = useCallback(() => {
    clearProviderTimer();
    setProviderLoaded(true);
    setProviderError(false);
    setProviderTimedOut(false);
  }, [clearProviderTimer]);

  const retryProvider = useCallback(() => {
    resetProviderState();
    // Changing a keyed iframe forces a clean navigation without cycling mirrors.
    setRetryKey((key) => key + 1);
  }, [resetProviderState]);

  const [retryKey, setRetryKey] = useState(0);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black" data-video-player-root="true">
      <div
        ref={containerRef}
        className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col bg-black"
        data-video-player-root="true"
      >
        <div className="z-20 flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/90 px-3 pb-2 pt-[calc(env(safe-area-inset-top)+8px)] backdrop-blur-md">
          <button type="button" onClick={() => void handleBack()} className="flex h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-sm text-white hover:bg-white/20" aria-label="Close player">
            <ArrowLeft className="h-4 w-4" />
            <span className="max-w-[160px] truncate">{title}</span>
          </button>

          {type === 'tv' && seasons.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Select value={String(selectedSeason)} onValueChange={(value) => { setSelectedSeason(Number(value)); setSelectedEpisode(1); resetProviderState(); }}>
                <SelectTrigger className="h-9 w-[105px] rounded-full border-white/15 bg-white/10 text-xs text-white">
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
              <Select value={String(selectedEpisode)} onValueChange={(value) => { setSelectedEpisode(Number(value)); resetProviderState(); }}>
                <SelectTrigger className="h-9 w-[100px] rounded-full border-white/15 bg-white/10 text-xs text-white">
                  <SelectValue placeholder="Episode" />
                </SelectTrigger>
                <SelectContent className="z-[10000] max-h-64">
                  {Array.from({ length: episodeCount }, (_, index) => index + 1).map((episode) => (
                    <SelectItem key={episode} value={String(episode)}>Episode {episode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="relative min-h-0 flex-1 bg-black">
          {videoUrl ? (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full bg-black object-contain"
              onError={() => setProviderError(true)}
            />
          ) : embedUrl ? (
            <>
              <iframe
                key={`${embedUrl}-${retryKey}`}
                src={embedUrl}
                className="h-full w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                title={`Watch ${title}`}
                loading="eager"
                onLoad={handleProviderLoad}
                onError={() => { clearProviderTimer(); setProviderError(true); }}
              />
              {!providerLoaded && !providerError && !providerTimedOut && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white/75">Connecting to configured provider…</div>
              )}
              {(providerError || providerTimedOut) && (
                <div role="alert" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/95 px-6 text-center text-white">
                  <p className="font-semibold">Provider unavailable</p>
                  <p className="max-w-md text-sm text-white/65">
                    {providerError ? 'The browser could not load the provider frame.' : 'The provider did not load within 15 seconds.'}
                    {' '}A loaded iframe does not confirm that the video itself is playing.
                  </p>
                  <Button onClick={retryProvider} variant="secondary" className="gap-2 rounded-full">
                    <RefreshCw className="h-4 w-4" /> Retry
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
              <p className="text-lg font-semibold">No streaming provider configured</p>
              <p className="max-w-lg text-sm text-white/65">
                Add VITE_VIDEO_EMBED_BASE_URL for a provider you are authorised to use, or pass a licensed direct MP4/HLS stream URL. TMDB does not supply full-movie video streams.
              </p>
            </div>
          )}

          <button type="button" onClick={() => void toggleFullscreen()} className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] right-4 z-40 rounded-full border border-white/15 bg-black/75 p-3 text-white shadow-lg backdrop-blur-md hover:bg-black" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LiveWatchModal;
