import type { ContentType } from '@/types/tmdb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  contentType: ContentType;
}

export const CategoryTabs = ({ currentCategory, setCurrentCategory, contentType }: CategoryTabsProps) => {
  const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'top_rated', label: 'Top Rated' },
    {
      key: 'upcoming',
      label: contentType === 'movie' ? 'Upcoming' : contentType === 'tv' ? 'On The Air' : 'Upcoming & On Air'
    },
    {
      key: 'now_playing',
      label: contentType === 'movie' ? 'Now Playing' : contentType === 'tv' ? 'Airing Today' : 'Now Playing & Airing'
    }
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide mb-4 md:mb-6">
      <div className="inline-flex p-1 rounded-2xl bg-secondary/50 border border-border/40 shadow-sm gap-0.5 w-max">
        {categories.map(category => {
          const isActive = currentCategory === category.key;
          return (
            <Button
              key={category.key}
              size="sm"
              variant="ghost"
              onClick={() => setCurrentCategory(category.key)}
              className={cn(
                'rounded-xl h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm font-semibold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              )}
            >
              {category.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
