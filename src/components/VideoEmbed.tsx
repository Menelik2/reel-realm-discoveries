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
  autoNext
}: VideoEmbedProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const vidsrcDomains = [
    'vidsrc.xyz',
  ];

  const getEmbedUrl = (domainIndex = 0) => {
    const id = tmdbId || imdbId;
    if (!id) return null;

    const domain = vidsrcDomains[domainIndex % vidsrcDomains.length];
    let embedUrl = `https://${domain}/embed/${type}/${id}`;

    // Append season and episode to the path for TV shows, as per the documentation
    if (type === 'tv') {
      if (season && episode) {
        embedUrl += `/${season}-${episode}`;
      }
    }

    const params = new URLSearchParams();
    
    // Common parameters as query strings
    if (dsLang) params.append('ds_lang', dsLang);
    if (autoPlay !== undefined) params.append('autoplay', String(autoPlay));
    // Corrected subtitle parameter from 'sub_file' to 'sub_url'
    if (subUrl) params.append('sub_url', subUrl);
    if (autoNext !== undefined) params.append('autonext', String(autoNext));

    const queryString = params.toString();
    if (queryString) {
      embedUrl += `?${queryString}`;
    }

    return embedUrl;
  };

  const handleError = () => {
    setIsLoading(true);
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      const nextDomainIndex = retryCount.current;
      console.log(`Error loading player. Retrying with domain: ${vidsrcDomains[nextDomainIndex % vidsrcDomains.length]}...`);
      setTimeout(() => {
        if (iframeRef.current) {
            iframeRef.current.src = getEmbedUrl(nextDomainIndex) || '';
            setHasError(false); // Reset for next attempt
        }
      }, 1000 * retryCount.current); // Linear backoff for retries
    } else {
      console.error(`Failed to load content after ${maxRetries} retries.`);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset state if IDs or type changes
    setHasError(false);
    setIsLoading(true);
    retryCount.current = 0;
    if (iframeRef.current) {
        iframeRef.current.src = getEmbedUrl(0) || '';
    }
  }, [tmdbId, imdbId, type, season, episode]);

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
