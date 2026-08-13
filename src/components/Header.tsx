import { useEffect, useRef, useState } from 'react';
import { Search, Menu, X, Moon, Sun, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { ActorSearch } from '@/components/ActorSearch';
import { InstallPrompt } from '@/components/InstallPrompt';
import { SearchOverlay } from '@/components/SearchOverlay';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const Header = ({ searchQuery, setSearchQuery, isDarkMode, setIsDarkMode }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOverlayOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Scroll-based hide / show
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const update = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      // Always show near the top
      if (currentY < 64) {
        setIsHidden(false);
      } else if (!isMobileMenuOpen && !isSearchOverlayOpen) {
        // Hide when scrolling down, show when scrolling up
        if (delta > 8) {
          setIsHidden(true);
        } else if (delta < -8) {
          setIsHidden(false);
        }
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobileMenuOpen, isSearchOverlayOpen]);

  // Keep header visible while menus are open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOverlayOpen) {
      setIsHidden(false);
    }
  }, [isMobileMenuOpen, isSearchOverlayOpen]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/?type=movie', label: 'Movies' },
    { to: '/?type=tv', label: 'TV Series' },
    { to: '/top-box-office', label: 'Box Office' },
  ];

  return (
    <>
      <header
        className={
          'fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/50 ' +
          'transition-transform duration-300 ease-out will-change-transform ' +
          (isHidden ? '-translate-y-full' : 'translate-y-0')
        }
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Film className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-playfair text-xl font-bold tracking-tight text-foreground">
                YENI<span className="text-primary">MOVIE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search movies & shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-secondary/50 border-border/50 rounded-full text-sm focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                aria-label="Open search"
                onClick={() => setIsSearchOverlayOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <InstallPrompt />
              <ActorSearch />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hidden md:flex h-9 w-9 rounded-full"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search movies & shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-secondary/50 border-border/50 rounded-full text-sm"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-border/50 pt-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1">
                {[...navLinks, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }, { to: '/privacy', label: 'Privacy' }].map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                >
                  <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
            </nav>
          )}
        </div>

        <SearchOverlay open={isSearchOverlayOpen} onOpenChange={setIsSearchOverlayOpen} />
      </header>

      {/* Spacer so content is not under the fixed header */}
      <div className="w-full shrink-0 md:h-16 h-[7.25rem]" aria-hidden="true" />
    </>
  );
};
