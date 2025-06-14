
import React from 'react';

interface VideoPlayerErrorProps {
  maxRetries: number;
}

const VideoPlayerError = ({ maxRetries }: VideoPlayerErrorProps) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
    <p className="font-semibold mb-2">Failed to Load Content</p>
    <p className="text-sm text-gray-400">
      Could not load the video after {maxRetries} retries.<br/>This content might be unavailable.<br/>Check the URL above or TMDB/IMDB ID.
    </p>
  </div>
);

export default VideoPlayerError;
