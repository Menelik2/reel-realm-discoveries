
import VideoEmbed from '@/components/VideoEmbed';
import { SourceSelector } from './SourceSelector';
import { AdBanner } from '../AdBanner';
import { SimilarMovies } from '../SimilarMovies';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MovieViewProps {
  movieId: number;
  contentType: 'movie';
  title: string;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  onClose: () => void;
}

export const MovieView = ({ movieId, contentType, title, selectedSource, onSourceChange, onClose }: MovieViewProps) => {
  const navigate = useNavigate();

  const handleSimilarMovieClick = (newMovieId: number) => {
    onClose();
    setTimeout(() => navigate(`/${contentType}/${newMovieId}`), 300);
  };

  return (
    <ScrollArea className="flex-grow container mx-auto max-w-7xl">
      <div className="p-4 md:p-6">
        <div className="w-full space-y-4">
          <SourceSelector selectedSource={selectedSource} onSourceChange={onSourceChange} />
          <div className="shadow-2xl shadow-primary/20 rounded-lg ring-1 ring-white/10 focus-within:ring-primary focus-within:ring-2 transition-all">
            <VideoEmbed 
              tmdbId={movieId} 
              type={contentType} 
              title={title} 
              autoPlay={1}
              source={selectedSource}
            />
          </div>
          <div className="mt-4">
            <AdBanner slot="2345678901" />
          </div>
        </div>
        <div className="w-full mt-8">
          <SimilarMovies 
            movieId={movieId} 
            contentType={contentType}
            onMovieClick={handleSimilarMovieClick}
          />
        </div>
      </div>
    </ScrollArea>
  );
};
