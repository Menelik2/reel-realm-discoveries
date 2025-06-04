
import { Button } from '@/components/ui/button';

interface ContentTypeToggleProps {
  contentType: 'movie' | 'tv';
  setContentType: (type: 'movie' | 'tv') => void;
}

export const ContentTypeToggle = ({ contentType, setContentType }: ContentTypeToggleProps) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <Button
          variant={contentType === 'movie' ? 'default' : 'outline'}
          onClick={() => setContentType('movie')}
        >
          Movies
        </Button>
        <Button
          variant={contentType === 'tv' ? 'default' : 'outline'}
          onClick={() => setContentType('tv')}
        >
          TV Series
        </Button>
      </div>
    </div>
  );
};
