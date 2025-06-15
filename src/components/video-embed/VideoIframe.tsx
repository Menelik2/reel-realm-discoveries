
import React, { forwardRef } from 'react';

interface VideoIframeProps {
  src: string;
  title: string;
  isLoading: boolean;
  onLoad: () => void;
  onError: () => void;
}

const VideoIframe = forwardRef<HTMLIFrameElement, VideoIframeProps>(
  ({ src, title, isLoading, onLoad, onError }, ref) => {
    return (
      <iframe
        ref={ref}
        src={src}
        className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Watch ${title}`}
        loading="eager"
        onLoad={onLoad}
        onError={onError}
        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation allow-top-navigation allow-popups"
      />
    );
  }
);

VideoIframe.displayName = 'VideoIframe';

export default VideoIframe;
