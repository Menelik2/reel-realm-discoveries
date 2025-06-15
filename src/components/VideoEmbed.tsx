import { useState, useEffect, useRef } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { getEmbedUrl } from '@/utils/videoEmbedUtils';
import VideoPlayerLoader from './video-embed/VideoPlayerLoader';
import VideoPlayerError from './video-embed/VideoPlayerError';
import VideoIframe from './video-embed/VideoIframe';

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
  type = "movie",
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugUrl, setDebugUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Debug: log embed url and render in UI
  useEffect(() => {
    const url = getEmbedUrl({ tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext, source });
    setDebugUrl(url || '');
    if (!url) {
      setHasError(true);
      setIsLoading(false);
    } else {
      setHasError(false);
      setIsLoading(true);
      retryCount.current = 0;
    }
    // eslint-disable-next-line
  }, [tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext, source]);

  const handleError = () => {
    setIsLoading(true);
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      setTimeout(() => {
        if (iframeRef.current) {
          const url = getEmbedUrl({ tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext, source });
          iframeRef.current.src = url || '';
          setHasError(false);
        }
      }, 1000 * retryCount.current);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => setIsLoading(false);

  // If a direct videoUrl is provided, use our custom video player instead of the embed iframe
  if (videoUrl) {
    return (
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
        <CustomVideoPlayer src={videoUrl} title={title} />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
      {/* The debug URL display has been removed to avoid confusing users. */}
      
      {isLoading && <VideoPlayerLoader />}

      {hasError && !isLoading ? (
        <VideoPlayerError maxRetries={maxRetries} />
      ) : (
        <VideoIframe
          key={debugUrl}
          ref={iframeRef}
          src={debugUrl}
          title={title}
          isLoading={isLoading}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default VideoEmbed;
