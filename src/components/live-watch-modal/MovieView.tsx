
import VideoEmbed from '@/components/VideoEmbed';
import { SourceSelector } from './SourceSelector';

interface MovieViewProps {
  movieId: number;
  contentType: 'movie';
  title: string;
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

export const MovieView = ({ movieId, contentType, title, selectedSource, onSourceChange }: MovieViewProps) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pt-8 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        <SourceSelector selectedSource={selectedSource} onSourceChange={onSourceChange} />
        <VideoEmbed 
          tmdbId={movieId} 
          type={contentType} 
          title={title} 
          autoPlay={1}
          source={selectedSource}
        />
      </div>
    </div>
  );
};
