
import { Button } from '@/components/ui/button';

interface CategoryTabsProps {
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  contentType: 'movie' | 'tv';
}

export const CategoryTabs = ({ currentCategory, setCurrentCategory, contentType }: CategoryTabsProps) => {
  const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'top_rated', label: 'Top Rated' },
    { key: 'upcoming', label: contentType === 'movie' ? 'Upcoming' : 'On The Air' },
    { key: 'now_playing', label: contentType === 'movie' ? 'Now Playing' : 'Airing Today' }
  ];

  return (
    <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6">
      {categories.map(category => (
        <Button
          key={category.key}
          variant={currentCategory === category.key ? 'default' : 'outline'}
          onClick={() => setCurrentCategory(category.key)}
          className="text-xs md:text-sm px-2 md:px-4 py-1 md:py-2"
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};
