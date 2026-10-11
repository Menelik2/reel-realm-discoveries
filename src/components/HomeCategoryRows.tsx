import type { ContentType } from '@/types/tmdb';
import { useState, memo } from 'react';
import { useMovieData } from '@/hooks/useMovieData';
import { useLazyVisible } from '@/hooks/useLazyVisible';
import { MovieCard } from '@/components/MovieCard';
import { AdBanner } from '@/components/AdBanner';
import { ContentTypeToggle } from '@/components/movie-grid/ContentTypeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Flame, Star, Clock, Play, Sparkles, ChevronRight } from 'lucide-react';
import { getGenresForContentType } from '@/constants/genres';

interface HomeCategoryRowsProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  onMovieClick: (movieId: number) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  popular: <TrendingUp className="h-4 w-4 text-primary" />,
  trending_week: <Flame className="h-4 w-4 text-primary" />,
  top_rated: <Star className="h-4 w-4 text-primary" />,
  upcoming: <Clock className="h-4 w-4 text-primary" />,
  now_playing: <Play className="h-4 w-4 text-primary" />,
  latest_releases: <Sparkles className="h-4 w-4 text-primary" />,
};

const CARD_WIDTH = 'w-[132px] sm:w-[148px] md:w-[168px] lg:w-[180px]';

/** Registered AdSense units used on home feed */
const HOME_AD_TOP = '1571190202';
const HOME_AD_MID = '7834561902';

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
    <div className="space-y-8 md:space-y-10 pb-24 md:pb-10">
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full min-w-0">
          <ContentTypeToggle contentType={contentType} setContentType={setContentType} />
          <div className="flex items-center gap-2 shrink-0 max-w-full">
            <span className="text-sm font-medium text-muted-foreground">Genre</span>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[150px] h-9 rounded-full bg-secondary/60 border-border/40 text-sm shadow-sm">
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
        <AdBanner slot={HOME_AD_TOP} className="my-2" />
      </div>

      {categories.map((category, index) => (
        <LazyCategorySection
          key={category.key}
          category={category}
          contentType={contentType}
          selectedGenre={selectedGenre}
          onMovieClick={onMovieClick}
          showAdAfter={index === 1}
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
  eager?: boolean;
}

const LazyCategorySection = memo(({ eager, ...props }: LazyCategorySectionProps) => {
  const { ref, isVisible } = useLazyVisible('120px');

  if (eager) return <CategorySection {...props} fetchEnabled />;

  return (
    <div ref={ref}>
      {isVisible ? (
        <CategorySection {...props} fetchEnabled />
      ) : (
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-5 rounded-full bg-primary" />
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground">{props.category.label}</h2>
          </div>
          <div className="media-row">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${CARD_WIDTH} aspect-[2/3] bg-secondary/80 rounded-2xl animate-pulse`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

LazyCategorySection.displayName = 'LazyCategorySection';

const CategorySection = memo(({ category, contentType, selectedGenre, onMovieClick, showAdAfter, fetchEnabled = true }: Omit<LazyCategorySectionProps, 'eager'> & { fetchEnabled?: boolean }) => {
  const { movies, loading } = useMovieData({
    searchQuery: '',
    selectedGenre,
    selectedYear: 'all',
    contentType,
    currentCategory: category.key,
    currentPage: 1,
    enabled: fetchEnabled,
  });

  const icon = categoryIcons[category.key];

  const adBlock = showAdAfter ? (
    <div className="container mx-auto px-4">
      <AdBanner slot={HOME_AD_MID} className="my-2" />
    </div>
  ) : null;

  if (loading) {
    return (
      <>
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2.5 mb-4">
            {icon || <div className="w-1 h-5 rounded-full bg-primary" />}
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground">{category.label}</h2>
          </div>
          <div className="media-row">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${CARD_WIDTH} aspect-[2/3] bg-secondary/80 animate-pulse rounded-2xl`} />
            ))}
          </div>
        </section>
        {adBlock}
      </>
    );
  }

  if (movies.length === 0) {
    return adBlock;
  }

  return (
    <>
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon || <div className="w-1 h-5 rounded-full bg-primary shrink-0" />}
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
              {category.label}
            </h2>
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full tabular-nums">
              {Math.min(movies.length, 12)}
            </span>
          </div>
          <span className="hidden md:inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
            Explore
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="media-row-edge">
          <div className="media-row">
            {movies.slice(0, 12).map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onMovieClick={onMovieClick}
                className={CARD_WIDTH}
              />
            ))}
          </div>
        </div>
      </section>
      {adBlock}
    </>
  );
});

CategorySection.displayName = 'CategorySection';
