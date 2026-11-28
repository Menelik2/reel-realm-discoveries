import { useEffect, useMemo, useRef, useState } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { getEmbedUrl, EMBED_SOURCES } from '@/utils/videoEmbedUtils';
import VideoPlayerLoader from './video-embed/VideoPlayerLoader';

interface VideoEmbedProps {
  tmdbId?: number;
  imdbId?: string;
  type?: 'movie' | 'tv';
  title: string;
  dsLang?: string;
  autoPlay?: 1 | 0;
  season?: number;
  episode?: number;
  subUrl?: string;
  autoNext?: 1 | 0;
  videoUrl?: string;
  source?: string;
}

const VideoEmbed = ({
  tmdbId,
  imdbId,
  type = 'movie',
  title,
  dsLang,
  autoPlay,
  season,
  episode,
  subUrl,
  autoNext,
  videoUrl,
  source,
}: VideoEmbedProps) => {
  const [providerLoaded, setProviderLoaded] = useState(false);
  const [providerError, setProviderError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const activeSource = source || EMBED_SOURCES[sourceIndex]?.url;

  const embedUrl = useMemo(
    () =>
      getEmbedUrl({
        tmdbId,
        imdbId,
        type,
        season,
        episode,
        dsLang,
        subUrl,
        autoPlay,
        autoNext,
        source: activeSource,
      }),
    [tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext, activeSource],
  );

  useEffect(() => {
    setProviderLoaded(false);
    setProviderError(false);
    setTimedOut(false);
    if (!embedUrl || videoUrl) return;

    timeoutRef.current = window.setTimeout(() => {
      // Auto-advance to next built-in source on timeout
      if (!source && sourceIndex < EMBED_SOURCES.length - 1) {
        setSourceIndex((i) => i + 1);
        setRetryKey((k) => k + 1);
        return;
      }
      setTimedOut(true);
    }, 12000);

    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [embedUrl, videoUrl, retryKey, source, sourceIndex]);

  if (videoUrl) {
    return (
      <div className="w-full overflow-hidden rounded-lg bg-black">
        <CustomVideoPlayer src={videoUrl} title={title} />
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-black p-6 text-center text-white">
        <p className="font-semibold">Unable to build player URL</p>
        <p className="max-w-lg text-sm text-white/65">
          Missing a valid TMDB or IMDb id for this title.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {!providerLoaded && !providerError && <VideoPlayerLoader />}
      <iframe
        key={`${embedUrl}-${retryKey}`}
        src={embedUrl}
        className={`h-full w-full border-0 ${providerLoaded ? 'opacity-100' : 'opacity-0'}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="no-referrer"
        title={`Watch ${title}`}
        loading="eager"
        onLoad={() => {
          if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          setProviderLoaded(true);
          setProviderError(false);
          setTimedOut(false);
        }}
        onError={() => {
          if (!source && sourceIndex < EMBED_SOURCES.length - 1) {
            setSourceIndex((i) => i + 1);
            setRetryKey((k) => k + 1);
            return;
          }
          setProviderError(true);
        }}
      />
      {(providerError || timedOut) && (
        <div
          role="alert"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black p-6 text-center text-white"
        >
          <p className="font-semibold">Stream unavailable</p>
          <p className="max-w-lg text-sm text-white/70">
            {providerError
              ? 'The browser could not load the player.'
              : 'The player took too long to load.'}{' '}
            Try again or pick another title.
          </p>
          <button
            type="button"
            className="rounded-full bg-white/15 px-4 py-2 text-sm hover:bg-white/25"
            onClick={() => {
              setSourceIndex(0);
              setProviderLoaded(false);
              setProviderError(false);
              setTimedOut(false);
              setRetryKey((key) => key + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoEmbed;
