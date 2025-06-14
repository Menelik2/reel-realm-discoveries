import { useState, useEffect, useRef } from 'react';

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
}: VideoEmbedProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugUrl, setDebugUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // === Strictly follow the official docs for vidsrc.xyz embed URLs ===
  function getEmbedUrl(): string | null {
    // MOVIE
    if (type === "movie") {
      // Use /embed/movie/{tmdbId} if available (preferred)
      if (tmdbId) {
        if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
          return `https://vidsrc.xyz/embed/movie/${tmdbId}`;
        } else {
          // query version
          const params = new URLSearchParams({ tmdb: String(tmdbId) });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined")
            params.append("autoplay", String(autoPlay));
          return `https://vidsrc.xyz/embed/movie?${params.toString()}`;
        }
      }
      // Otherwise, fallback to imdbId
      if (imdbId) {
        if (!dsLang && !subUrl && typeof autoPlay === "undefined") {
          return `https://vidsrc.xyz/embed/movie/${imdbId}`;
        } else {
          // query version
          const params = new URLSearchParams({ imdb: imdbId });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined")
            params.append("autoplay", String(autoPlay));
          return `https://vidsrc.xyz/embed/movie?${params.toString()}`;
        }
      }
      return null;
    }

    // TV SHOW
    if (type === "tv" && !season && !episode) {
      if (tmdbId) {
        if (!dsLang) {
          return `https://vidsrc.xyz/embed/tv/${tmdbId}`;
        } else {
          const params = new URLSearchParams({ tmdb: String(tmdbId) });
          params.append("ds_lang", dsLang);
          return `https://vidsrc.xyz/embed/tv?${params.toString()}`;
        }
      }
      if (imdbId) {
        if (!dsLang) {
          return `https://vidsrc.xyz/embed/tv/${imdbId}`;
        } else {
          const params = new URLSearchParams({ imdb: imdbId });
          params.append("ds_lang", dsLang);
          return `https://vidsrc.xyz/embed/tv?${params.toString()}`;
        }
      }
      return null;
    }

    // EPISODE
    if (type === "tv" && season && episode) {
      if (tmdbId) {
        if (
          !dsLang &&
          !subUrl &&
          typeof autoPlay === "undefined" &&
          typeof autoNext === "undefined"
        ) {
          return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}-${episode}`;
        } else {
          const params = new URLSearchParams({
            tmdb: String(tmdbId),
            season: String(season),
            episode: String(episode),
          });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined")
            params.append("autoplay", String(autoPlay));
          if (typeof autoNext !== "undefined")
            params.append("autonext", String(autoNext));
          return `https://vidsrc.xyz/embed/tv?${params.toString()}`;
        }
      }
      if (imdbId) {
        if (
          !dsLang &&
          !subUrl &&
          typeof autoPlay === "undefined" &&
          typeof autoNext === "undefined"
        ) {
          return `https://vidsrc.xyz/embed/tv/${imdbId}/${season}-${episode}`;
        } else {
          const params = new URLSearchParams({
            imdb: imdbId,
            season: String(season),
            episode: String(episode),
          });
          if (dsLang) params.append("ds_lang", dsLang);
          if (subUrl) params.append("sub_url", subUrl);
          if (typeof autoPlay !== "undefined")
            params.append("autoplay", String(autoPlay));
          if (typeof autoNext !== "undefined")
            params.append("autonext", String(autoNext));
          return `https://vidsrc.xyz/embed/tv?${params.toString()}`;
        }
      }
      return null;
    }
    return null;
  }

  // Debug: log embed url and render in UI
  useEffect(() => {
    const url = getEmbedUrl();
    setDebugUrl(url || '');
    if (!url) {
      setHasError(true);
      setIsLoading(false);
    } else {
      setHasError(false);
      setIsLoading(true);
      retryCount.current = 0;
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
    }
    // eslint-disable-next-line
  }, [tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext]);

  const handleError = () => {
    setIsLoading(true);
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      setTimeout(() => {
        if (iframeRef.current) {
          const url = getEmbedUrl();
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
      {/* DEBUG: Show the used embed URL */}
      <div className="absolute top-2 left-2 z-20 text-xs text-white bg-black/50 p-1 rounded shadow" style={{pointerEvents: 'auto'}}>
        <span className="font-mono">Embed URL:&nbsp;</span>
        <a href={debugUrl} target="_blank" rel="noopener noreferrer" className="underline">{debugUrl}</a>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-pulse text-white">Loading player...</div>
        </div>
      )}

      {hasError && !isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
          <p className="font-semibold mb-2">Failed to Load Content</p>
          <p className="text-sm text-gray-400">
            Could not load the video after {maxRetries} retries.<br/>This content might be unavailable.<br/>Check the URL above or TMDB/IMDB ID.
          </p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={debugUrl}
          className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="origin"
          title={`Watch ${title}`}
          loading="eager"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      )}
    </div>
  );
};

export default VideoEmbed;
