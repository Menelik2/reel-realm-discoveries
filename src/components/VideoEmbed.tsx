import { useEffect, useMemo, useState } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { getEmbedUrl } from '@/utils/videoEmbedUtils';
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

  const embedUrl = useMemo(
    () => getEmbedUrl({ tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext, source }),
    [tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext, source],
  );

  useEffect(() => {
    setProviderLoaded(false);
    setProviderError(false);
    setTimedOut(false);
    if (!embedUrl || videoUrl) return;

    const timer = window.setTimeout(() => {
      if (!providerLoaded) setTimedOut(true);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [embedUrl, videoUrl, providerLoaded]);

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
        <p className="font-semibold">Streaming provider not configured</p>
        <p className="max-w-lg text-sm text-white/65">
          Add VITE_VIDEO_EMBED_BASE_URL for a streaming provider you are authorised to use. TMDB provides catalogue information, not full-movie streams.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {!providerLoaded && !providerError && <VideoPlayerLoader />}
      <iframe
        key={embedUrl}
        src={embedUrl}
        className={`h-full w-full border-0 ${providerLoaded ? 'opacity-100' : 'opacity-0'}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title={`Watch ${title}`}
        loading="eager"
        onLoad={() => setProviderLoaded(true)}
        onError={() => setProviderError(true)}
      />
      {(providerError || timedOut) && (
        <div role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black p-6 text-center text-white">
          <p className="font-semibold">The streaming provider did not respond</p>
          <p className="max-w-lg text-sm text-white/70">
            {providerError ? 'The browser could not load the provider frame.' : 'The provider took too long to load.'}
            {' '}An iframe load event cannot confirm that a stream is actually playing.
          </p>
          <button type="button" className="rounded-full bg-white/15 px-4 py-2 text-sm hover:bg-white/25" onClick={() => { setProviderLoaded(false); setProviderError(false); setTimedOut(false); }}>
            Retry provider
          </button>
        </div>
      )}
      {providerLoaded && !providerError && (
        <p className="sr-only" aria-live="polite">Provider frame loaded. Playback status is controlled by the provider.</p>
      )}
    </div>
  );
};

export default VideoEmbed;
