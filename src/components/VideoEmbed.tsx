import { useState, useEffect } from 'react';
import { VideoStreamingService } from '@/api/videoStreamingService';
import VideoPlayerLoader from './video-embed/VideoPlayerLoader';
import VideoPlayerError from './video-embed/VideoPlayerError';
import { VideoSourceSelector } from './VideoSourceSelector';
import { AdBanner } from './AdBanner';

interface VideoSource {
  name: string;
  url: string;
  quality?: string;
  isVip?: boolean;
}

interface VideoEmbedProps {
  tmdbId: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  onError?: (error: string) => void;
  className?: string;
}

export const VideoEmbed = ({ 
  tmdbId, 
  imdbId,
  type, 
  season, 
  episode, 
  title,
  onError,
  className = ""
}: VideoEmbedProps) => {
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 2;

  useEffect(() => {
    loadVideoSources();
  }, [tmdbId, imdbId, type, season, episode]);

  const loadVideoSources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let videoSources: VideoSource[];
      
      if (type === 'movie') {
        videoSources = await VideoStreamingService.getMovieSources(tmdbId, imdbId);
      } else {
        if (!season || !episode) {
          throw new Error('Season and episode are required for TV shows');
        }
        videoSources = await VideoStreamingService.getTVShowSources(tmdbId, season, episode, imdbId);
      }

      if (videoSources.length === 0) {
        throw new Error('No video sources available');
      }

      setSources(videoSources);
      setCurrentSourceIndex(0);
    } catch (error) {
      console.error('Error loading video sources:', error);
      setError(error instanceof Error ? error.message : 'Failed to load video');
      onError?.(error instanceof Error ? error.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (index: number) => {
    setCurrentSourceIndex(index);
    setError(null);
    setRetryCount(0);
  };

  const handleIframeError = () => {
    const nextIndex = currentSourceIndex + 1;
    
    if (nextIndex < sources.length) {
      console.log(`Source ${sources[currentSourceIndex].name} failed, trying next source...`);
      setCurrentSourceIndex(nextIndex);
      setRetryCount(0);
    } else if (retryCount < maxRetries) {
      console.log(`All sources failed, retrying... (${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      setCurrentSourceIndex(0);
    } else {
      const errorMsg = 'All video sources failed to load';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const currentSource = sources[currentSourceIndex];

  if (loading) {
    return (
      <div className={`relative aspect-video w-full bg-black rounded-lg overflow-hidden ${className}`}>
        <VideoPlayerLoader />
      </div>
    );
  }

  if (error || !currentSource) {
    return (
      <div className={`relative aspect-video w-full bg-black rounded-lg overflow-hidden ${className}`}>
        <VideoPlayerError 
          maxRetries={maxRetries}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Source Selector */}
      {sources.length > 1 && (
        <VideoSourceSelector
          sources={sources}
          currentIndex={currentSourceIndex}
          onSourceChange={handleSourceChange}
        />
      )}

      {/* Video Player */}
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
        <iframe
          key={`${currentSource.url}-${retryCount}`}
          src={currentSource.url}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation"
          onError={handleIframeError}
          onLoad={() => {
            console.log(`Successfully loaded: ${currentSource.name}`);
          }}
        />
        
        {/* VIP Badge */}
        {currentSource.isVip && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
            VIP Quality
          </div>
        )}
        
        {/* Ad Banner */}
        <div className="absolute bottom-4 right-4 z-10 w-1/2 md:w-1/3 max-w-[300px]">
          <AdBanner slot="4567890123" format="auto" />
        </div>
      </div>

      {/* Source Info */}
      <div className="mt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Playing from: <span className="font-medium">{currentSource.name}</span>
          {currentSource.quality && (
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
              {currentSource.quality}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default VideoEmbed;