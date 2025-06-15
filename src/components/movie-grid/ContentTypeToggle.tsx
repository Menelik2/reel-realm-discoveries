
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ContentTypeToggleProps {
  contentType: 'movie' | 'tv';
  setContentType: (type: 'movie' | 'tv') => void;
  onRefresh: () => void;
}

export const ContentTypeToggle = ({ contentType, setContentType, onRefresh }: ContentTypeToggleProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
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
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Refresh content to get the latest updates"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
