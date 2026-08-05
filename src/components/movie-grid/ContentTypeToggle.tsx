import { Button } from '@/components/ui/button';
import type { ContentType } from '@/types/tmdb';

interface ContentTypeToggleProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
}

const TABS: { key: ContentType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movie' },
  { key: 'tv', label: 'TV Show' },
  { key: 'anime', label: 'Anime' },
  { key: 'asian', label: 'Asian' },
];

export const ContentTypeToggle = ({ contentType, setContentType }: ContentTypeToggleProps) => {
  return (
    <div className="mb-4 md:mb-6 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain scrollbar-hide">
      <div className="flex gap-1.5 md:gap-2 w-max">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={contentType === tab.key ? 'default' : 'outline'}
            onClick={() => setContentType(tab.key)}
            className="rounded-full h-8 md:h-9 px-3 md:px-5 text-xs md:text-sm font-medium whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>

  );
};
