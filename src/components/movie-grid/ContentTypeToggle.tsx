import { Button } from '@/components/ui/button';
import type { ContentType } from '@/types/tmdb';
import { cn } from '@/lib/utils';

interface ContentTypeToggleProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
}

const TABS: { key: ContentType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Shows' },
  { key: 'anime', label: 'Anime' },
  { key: 'asian', label: 'Asian' },
];

export const ContentTypeToggle = ({ contentType, setContentType }: ContentTypeToggleProps) => {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain scrollbar-hide">
      <div className="inline-flex p-1 rounded-2xl bg-secondary/50 border border-border/40 shadow-sm gap-0.5 w-max">
        {TABS.map((tab) => {
          const isActive = contentType === tab.key;
          return (
            <Button
              key={tab.key}
              size="sm"
              variant="ghost"
              onClick={() => setContentType(tab.key)}
              className={cn(
                'rounded-xl h-8 md:h-9 px-3.5 md:px-4 text-xs md:text-sm font-semibold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              )}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
