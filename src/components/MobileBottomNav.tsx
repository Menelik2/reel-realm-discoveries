import { Link, useSearchParams } from 'react-router-dom';
import { Home, Play, Star, Search, BarChart3, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { MobileSearchDialog } from './MobileSearchDialog';
import { useScrollHide } from '@/hooks/useScrollHide';

export const MobileBottomNav = () => {
  const [searchParams] = useSearchParams();
  const currentType = searchParams.get('type');
  const isHomePath = typeof window !== 'undefined' && window.location.pathname === '/';
  const isBoxOfficePath = typeof window !== 'undefined' && window.location.pathname === '/top-box-office';
  const isFranchisesPath =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/franchises' || window.location.pathname.startsWith('/franchise/'));
  const [searchOpen, setSearchOpen] = useState(false);

  const isHidden = useScrollHide({
    forceVisible: searchOpen,
    threshold: 6,
    topOffset: 48,
  });

  const navItems = [
    { id: 'home', to: '/?category=popular', icon: Home, label: 'Home', isActive: isHomePath && !currentType },
    { id: 'movies', to: '/?category=popular&type=movie', icon: Play, label: 'Movies', isActive: isHomePath && currentType === 'movie' },
    { id: 'tv', to: '/?category=popular&type=tv', icon: Star, label: 'Series', isActive: isHomePath && currentType === 'tv' },
    { id: 'franchises', to: '/franchises', icon: Layers, label: 'Franchises', isActive: isFranchisesPath },
    { id: 'box_office', to: '/top-box-office', icon: BarChart3, label: 'Box Office', isActive: isBoxOfficePath },
  ];

  return (
    <>
      <div
        className={cn(
          'mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden',
          'bg-background/85 backdrop-blur-2xl border-t border-border/40',
          'supports-[backdrop-filter]:bg-background/75',
          'transition-transform duration-300 ease-out will-change-transform',
          isHidden ? 'translate-y-full' : 'translate-y-0'
        )}
      >
        <nav
          className="flex justify-around items-center h-16 px-1.5 pb-[env(safe-area-inset-bottom,0px)]"
          aria-label="Primary"
        >
          {navItems.map(({ to, icon: Icon, label, isActive }) => (
            <Link
              key={label}
              to={to}
              replace
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full rounded-2xl transition-all pressable',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-7 rounded-full transition-all',
                isActive && 'bg-primary/15'
              )}>
                <Icon className={cn('h-5 w-5', isActive && 'scale-105')} aria-hidden="true" />
              </div>
              <span className={cn('text-[10px] font-semibold mt-0.5', isActive && 'text-primary')}>
                {label}
              </span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="flex flex-col items-center justify-center text-muted-foreground w-full h-full rounded-2xl transition-all hover:text-foreground pressable"
          >
            <div className="flex items-center justify-center w-10 h-7">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Search</span>
          </button>
        </nav>
      </div>
      <MobileSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
