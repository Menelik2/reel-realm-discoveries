
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
        referrerPolicy="origin"
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-presentation"
        title={`Watch ${title}`}
        loading="eager"
        onLoad={onLoad}
        onError={onError}
      />
    );
  }
);

VideoIframe.displayName = 'VideoIframe';

export default VideoIframe;
