
import { TriangleAlert } from 'lucide-react';

interface VideoPlayerErrorProps {
  maxRetries: number;
}

const VideoPlayerError = ({ maxRetries }: VideoPlayerErrorProps) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 text-center">
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive bg-card p-6 max-w-sm text-card-foreground">
        <TriangleAlert className="h-10 w-10 text-destructive" />
        <h3 className="mt-4 text-xl font-semibold">Failed to Load Content</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't load the video after {maxRetries} attempts. This can happen if the source is offline or the content is not available.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Please try changing the video source.
        </p>
    </div>
  </div>
);

export default VideoPlayerError;
