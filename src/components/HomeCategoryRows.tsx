import type { ContentType } from '@/types/tmdb';
import { useState, memo } from 'react';
import { useMovieData } from '@/hooks/useMovieData';
import { useLazyVisible } from '@/hooks/useLazyVisible';
import { MovieCard } from '@/components/MovieCard';
import { AdBanner } from '@/components/AdBanner';
import { ContentTypeToggle } from '@/components/movie-grid/ContentTypeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Flame, Star, Clock, Play, Sparkles } from 'lucide-react';
import { getGenresForContentType } from '@/constants/genres';

interface HomeCategoryRowsProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  onMovieClick: (movieId: number) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  popular: <TrendingUp className="h-5 w-5 text-primary" />,
  trending_week: <Flame className="h-5 w-5 text-primary" />,
  top_rated: <Star className="h-5 w-5 text-primary" />,
  upcoming: <Clock className="h-5 w-5 text-primary" />,
  now_playing: <Play className="h-5 w-5 text-primary" />,
  latest_releases: <Sparkles className="h-5 w-5 text-primary" />,
};

// Slightly denser grid = smaller cards
const CARD_GRID = 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3';

export const HomeCategoryRows = ({ contentType, setContentType, onMovieClick }: HomeCategoryRowsProps) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const categories = [
    { key: 'popular', label: 'Popular' },
    { key: 'trending_week', label: 'Trending This Week' },
    { key: 'top_rated', label: 'Top Rated' },
    { key: 'upcoming', label: contentType === 'movie' ? 'Upcoming' : 'On The Air' },
    { key: 'now_playing', label: contentType === 'movie' ? 'Now Playing' : 'Airing Today' },
    { key: 'latest_releases', label: 'Latest Releases' }
  ];

  return (
    <div className="space-y-10 pb-24 md:pb-8">
      {/* Filters bar */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full min-w-0">
          <ContentTypeToggle contentType={contentType} setContentType={setContentType} />
          <div className="flex items-center gap-2 shrink-0 max-w-full">

            <span className="text-sm font-medium text-muted-foreground">Genre:</span>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[160px] h-9 rounded-full bg-secondary/50 border-border/50 text-sm">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {getGenresForContentType(contentType).map(g => (
                  <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <AdBanner slot="1571190202" />
      </div>

      {categories.map((category, index) => (
        <LazyCategorySection
          key={category.key}
          category={category}
          contentType={contentType}
          selectedGenre={selectedGenre}
          onMovieClick={onMovieClick}
          showAdAfter={index === 1}
          sectionIndex={index}
          eager={index < 1}
        />
      ))}
    </div>
  );
};

interface LazyCategorySectionProps {
  category: { key: string; label: string };
  contentType: ContentType;
  selectedGenre: string;
  onMovieClick: (movieId: number) => void;
  showAdAfter?: boolean;
  sectionIndex: number;
  eager?: boolean;
}

const LazyCategorySection = memo(({ eager, ...props }: LazyCategorySectionProps) => {
  const { ref, isVisible } = useLazyVisible('80px');

  if (eager) return <CategorySection {...props} />;

  return (
    <div ref={ref}>
      {isVisible ? (
        <CategorySection {...props} />
      ) : (
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{props.category.label}</h2>
          </div>
          <div className={CARD_GRID}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary rounded-lg" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

LazyCategorySection.displayName = 'LazyCategorySection';

const CategorySection = memo(({ category, contentType, selectedGenre, onMovieClick, showAdAfter, sectionIndex }: Omit<LazyCategorySectionProps, 'eager'>) => {
  const { movies, loading } = useMovieData({
    searchQuery: '',
    selectedGenre,
    selectedYear: 'all',
    contentType,
    currentCategory: category.key,
    currentPage: 1,
    enabled: true,
  });

  const icon = categoryIcons[category.key];

  if (loading) {
    return (
      <>
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{category.label}</h2>
          </div>
          <div className={CARD_GRID}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary animate-pulse rounded-lg" />
            ))}
          </div>
        </section>
        {showAdAfter && (
          <div className="container mx-auto px-4">
            <AdBanner slot={`892642019${sectionIndex}`} className="my-6" />
          </div>
        )}
      </>
    );
  }

  if (movies.length === 0) {
    return showAdAfter ? (
      <div className="container mx-auto px-4">
        <AdBanner slot={`892642019${sectionIndex}`} className="my-6" />
      </div>
    ) : null;
  }

  return (
    <>
      <section className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-5">
          {icon || <div className="w-1 h-6 rounded-full bg-primary" />}
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{category.label}</h2>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {Math.min(movies.length, 14)}
          </span>
        </div>
        <div className={CARD_GRID}>
          {movies.slice(0, 14).map(movie => (
            <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
          ))}
        </div>
      </section>
      {showAdAfter && (
        <div className="container mx-auto px-4">
          <AdBanner slot={`892642019${sectionIndex}`} className="my-6" />
        </div>
      )}
    </>
  );
});

CategorySection.displayName = 'CategorySection';
