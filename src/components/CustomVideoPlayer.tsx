import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  controls?: boolean;
  onPlaybackStart?: () => void;
  onPlaybackError?: (message: string) => void;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  title = 'Video Player',
  poster,
  controls = true,
  onPlaybackStart,
  onPlaybackError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const validatedSource = useCallback(() => {
    try {
      const url = new URL(src);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, [src]);

  useEffect(() => {
    setError(null);
    setIsReady(false);
    if (!validatedSource()) {
      setError('The video URL is invalid. Provide a valid HTTPS video URL.');
    }
  }, [src, validatedSource]);

  const handleError = () => {
    const mediaError = videoRef.current?.error;
    const message = mediaError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
      ? 'This video format is not supported by your browser. HLS streams require native HLS support or an authorised HLS playback integration.'
      : 'The video could not be played. Check that the stream is online and that your account has permission to access it.';
    setError(message);
    onPlaybackError?.(message);
  };

  if (error) {
    return (
      <div role="alert" className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg bg-black p-6 text-center text-white">
        <p className="text-base font-semibold">Unable to play this video</p>
        <p className="max-w-lg text-sm text-white/70">{error}</p>
      </div>
    );
  }

  if (!src || !validatedSource()) {
    return <div className="flex aspect-video items-center justify-center bg-black p-4 text-center text-white">A valid video stream URL is required.</div>;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-white/70" aria-live="polite">
          Preparing video…
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={controls}
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain"
        aria-label={title}
        onLoadedMetadata={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
        onPlaying={() => onPlaybackStart?.()}
        onError={handleError}
      >
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
};

export default CustomVideoPlayer;
