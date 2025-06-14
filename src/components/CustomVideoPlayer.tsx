
import React from "react";

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  controls?: boolean;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  title = "Video Player",
  poster,
  controls = true,
}) => {
  if (!src) {
    return <div className="p-4 bg-gray-800 text-white text-center rounded">Invalid video source.</div>;
  }

  // We could also include logic for m3u8/hls if needed in the future.
  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
      <video
        src={src}
        poster={poster}
        controls={controls}
        className="w-full h-full object-contain bg-black"
        style={{ maxHeight: "100%" }}
        title={title}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default CustomVideoPlayer;
