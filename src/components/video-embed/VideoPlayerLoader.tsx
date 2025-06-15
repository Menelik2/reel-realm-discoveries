
import { Loader2 } from 'lucide-react';

const VideoPlayerLoader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="mt-4 text-base font-medium">Loading Player...</p>
    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
  </div>
);

export default VideoPlayerLoader;
