
import React, { useEffect, useRef } from "react";

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  quality?: 'auto' | '720p' | '1080p';
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  title = "Video Player",
  poster,
  controls = true,
  autoPlay = false,
  quality = 'auto',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Check if the source is an HLS stream (.m3u8)
    const isHLS = src.includes('.m3u8') || src.includes('m3u8');

    if (isHLS && typeof window !== 'undefined') {
      // Dynamic import for HLS.js (client-side only)
      import('hls.js').then((HlsModule) => {
        const Hls = HlsModule.default;
        
        if (Hls.isSupported()) {
          // Clean up previous HLS instance
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest loaded');
            if (autoPlay) {
              video.play().catch(console.error);
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Fatal network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Fatal media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.log('Fatal error, cannot recover');
                  hls.destroy();
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari native HLS support
          video.src = src;
          if (autoPlay) {
            video.play().catch(console.error);
          }
        }
      }).catch((error) => {
        console.error('Failed to load HLS.js:', error);
        // Fallback to regular video
        video.src = src;
        if (autoPlay) {
          video.play().catch(console.error);
        }
      });
    } else {
      // Regular video file
      video.src = src;
      if (autoPlay) {
        video.play().catch(console.error);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  if (!src) {
    return (
      <div className="p-4 bg-gray-800 text-white text-center rounded flex items-center justify-center min-h-[200px]">
        <div>
          <div className="text-lg font-semibold mb-2">No Video Source</div>
          <div className="text-sm text-gray-400">Please check the video URL or try a different source.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black relative">
      <video
        ref={videoRef}
        poster={poster}
        controls={controls}
        className="w-full h-full object-contain bg-black"
        style={{ maxHeight: "100%" }}
        title={title}
        crossOrigin="anonymous"
        playsInline
        preload="metadata"
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
      
      {/* Quality indicator */}
      {quality && quality !== 'auto' && (
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {quality}
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
