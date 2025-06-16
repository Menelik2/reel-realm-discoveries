
import { Link, useSearchParams } from 'react-router-dom';
import { Home, Play, Star, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'popular';

  const navItems = [
    { category: 'popular', to: '/?category=popular', icon: Home, label: 'Home' },
    { category: 'now_playing', to: '/?category=now_playing', icon: Play, label: 'Playing' },
    { category: 'top_rated', to: '/?category=top_rated', icon: Star, label: 'Top Rated' },
    { category: 'upcoming', to: '/?category=upcoming', icon: TrendingUp, label: 'Upcoming' },
    { category: 'box_office', to: '/top-box-office', icon: BarChart3, label: 'Box Office' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItems.map(({ category, to, icon: Icon, label }) => (
          <Link
            key={label}
            to={to}
            replace
            className={cn(
              'flex flex-col items-center justify-center text-muted-foreground w-full h-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm',
              (currentCategory === category || (category === 'box_office' && window.location.pathname === '/top-box-office')) ? 'text-primary' : 'hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
