
import { useState, useEffect, useRef } from 'react';

interface VideoEmbedProps {
  tmdbId: number;
  type?: 'movie' | 'tv';
  title: string;
  enableAdBlock?: boolean;
}

const VideoEmbed = ({ tmdbId, type = "movie", title, enableAdBlock = true }: VideoEmbedProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 2; // Total 3 attempts (initial + 2 retries)

  // List of alternative domains for fallback
  const vidsrcDomains = [
    'vidsrc.to',
    'vidsrc.in',
    'vidsrc.stream',
  ];

  const getEmbedUrl = (domainIndex = 0) => {
    if (!tmdbId) return null;
    const domain = vidsrcDomains[domainIndex % vidsrcDomains.length];
    return `https://${domain}/embed/${type}/${tmdbId}`;
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
      }, 1000 * retryCount.current); // Simple backoff
    } else {
      console.error(`Failed to load content after ${maxRetries + 1} attempts.`);
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Ad-blocking: this is a best-effort approach and might not catch all ads
  // due to cross-origin restrictions on iframes.
  useEffect(() => {
    if (!enableAdBlock || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME') {
            const adIframe = node as HTMLIFrameElement;
            if (/ads?|doubleclick|adservice/i.test(adIframe.src)) {
              console.log('Ad-blocking: removing suspected ad iframe:', adIframe.src);
              adIframe.remove();
            }
          }
        });
      });
    });

    const handleIframeLoad = () => {
      setIsLoading(false);
      try {
        if (iframe.contentDocument) {
          observer.observe(iframe.contentDocument.body, { childList: true, subtree: true });
        }
      } catch (e) {
        console.warn('Could not attach MutationObserver to iframe due to cross-origin policy. Ad-blocking may be limited.');
      }
    };

    iframe.addEventListener('load', handleIframeLoad);
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      observer.disconnect();
    };
  }, [enableAdBlock]);

  useEffect(() => {
    // Reset state if tmdbId changes
    setHasError(false);
    setIsLoading(true);
    retryCount.current = 0;
    if (iframeRef.current) {
        iframeRef.current.src = getEmbedUrl(0) || '';
    }
  }, [tmdbId, type]);

  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-pulse text-white">Loading player...</div>
        </div>
      )}

      {hasError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
          <p className="font-semibold mb-2">Failed to Load Content</p>
          <p className="text-sm text-gray-400">
            Could not load the video after several attempts. This content might be unavailable.
          </p>
        </div>
      )}
        <iframe
          ref={iframeRef}
          src={getEmbedUrl() || ''}
          className={`w-full h-full ${isLoading || hasError ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="origin"
          title={`Watch ${title}`}
          loading="eager"
          onError={handleError}
          sandbox="allow-same-origin allow-scripts"
        />
    </div>
  );
};

export default VideoEmbed;
