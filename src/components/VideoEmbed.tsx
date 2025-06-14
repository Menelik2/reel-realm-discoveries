
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
}: VideoEmbedProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Only supporting vidsrc.xyz
  const VID_SRC_DOMAIN = 'vidsrc.xyz';

  // Builds the proper embed URL for the movie or tv show using the doc requirements
  const getEmbedUrl = () => {
    if (!tmdbId && !imdbId) return null;

    let baseUrl = '';
    let queryParams = new URLSearchParams();

    // Prefer path style if possible, else fallback to query style if required by docs
    if (type === 'movie') {
      if (tmdbId) {
        // https://vidsrc.xyz/embed/movie/385687
        baseUrl = `https://${VID_SRC_DOMAIN}/embed/movie/${tmdbId}`;
      } else if (imdbId) {
        // https://vidsrc.xyz/embed/movie/tt5433140
        baseUrl = `https://${VID_SRC_DOMAIN}/embed/movie/${imdbId}`;
      }

      // If only imdbId or tmdbId supplied with query params style:
      // https://vidsrc.xyz/embed/movie?imdb=tt5433140 or ?tmdb=385687
      // Detect if additional options need to be set with "?"
      const useQueryStyle =
        (!tmdbId && !!imdbId) ||
        (!imdbId && !!tmdbId && (dsLang || subUrl || typeof autoPlay !== "undefined"));

      if (useQueryStyle) {
        baseUrl = `https://${VID_SRC_DOMAIN}/embed/movie`;
        if (imdbId) queryParams.append("imdb", imdbId);
        else if (tmdbId) queryParams.append("tmdb", String(tmdbId));
      }

      if (dsLang) queryParams.append("ds_lang", dsLang);
      if (subUrl) queryParams.append("sub_url", subUrl);
      if (typeof autoPlay !== "undefined") queryParams.append("autoplay", String(autoPlay));
      // Only movie: NO autonext parameter in docs for movie (ignore)
    } else if (type === 'tv') {
      if (season && episode) {
        // Official episode embed: https://vidsrc.xyz/embed/tv/1399/1-1
        if (tmdbId) {
          baseUrl = `https://${VID_SRC_DOMAIN}/embed/tv/${tmdbId}/${season}-${episode}`;
        } else if (imdbId) {
          baseUrl = `https://${VID_SRC_DOMAIN}/embed/tv/${imdbId}/${season}-${episode}`;
        }

        // Also allow alternative (?tmdb=ID&season=1&episode=1), e.g. for query params mode
        const useQueryStyle =
          (!tmdbId && !!imdbId) ||
          (!imdbId && !!tmdbId && (dsLang || subUrl || typeof autoPlay !== "undefined" || typeof autoNext !== "undefined"));

        if (useQueryStyle) {
          baseUrl = `https://${VID_SRC_DOMAIN}/embed/tv`;
          if (imdbId) queryParams.append("imdb", imdbId);
          else if (tmdbId) queryParams.append("tmdb", String(tmdbId));
          queryParams.append("season", String(season));
          queryParams.append("episode", String(episode));
        }
        if (dsLang) queryParams.append("ds_lang", dsLang);
        if (subUrl) queryParams.append("sub_url", subUrl);
        if (typeof autoPlay !== "undefined") queryParams.append("autoplay", String(autoPlay));
        if (typeof autoNext !== "undefined") queryParams.append("autonext", String(autoNext));
      } else {
        // Official TV show embed (no episode): https://vidsrc.xyz/embed/tv/1399
        if (tmdbId) {
          baseUrl = `https://${VID_SRC_DOMAIN}/embed/tv/${tmdbId}`;
        } else if (imdbId) {
          baseUrl = `https://${VID_SRC_DOMAIN}/embed/tv/${imdbId}`;
        }

        // Or query style if needed
        const useQueryStyle =
          (!tmdbId && !!imdbId) ||
          (!imdbId && !!tmdbId && (dsLang || subUrl || typeof autoPlay !== "undefined" || typeof autoNext !== "undefined"));

        if (useQueryStyle) {
          baseUrl = `https://${VID_SRC_DOMAIN}/embed/tv`;
          if (imdbId) queryParams.append("imdb", imdbId);
          else if (tmdbId) queryParams.append("tmdb", String(tmdbId));
        }
        if (dsLang) queryParams.append("ds_lang", dsLang);
      }
    } else {
      return null;
    }

    // Compose full URL
    const qs = queryParams.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  const handleError = () => {
    setIsLoading(true);
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = getEmbedUrl() || '';
          setHasError(false);
        }
      }, 1000 * retryCount.current);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => setIsLoading(false);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    retryCount.current = 0;
    if (iframeRef.current) {
      iframeRef.current.src = getEmbedUrl() || '';
    }
    // eslint-disable-next-line
  }, [tmdbId, imdbId, type, season, episode, dsLang, subUrl, autoPlay, autoNext]);

  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-pulse text-white">Loading player...</div>
        </div>
      )}

      {hasError && !isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
          <p className="font-semibold mb-2">Failed to Load Content</p>
          <p className="text-sm text-gray-400">
            Could not load the video after {maxRetries} retries. This content might be unavailable.
          </p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={getEmbedUrl() || ''}
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
