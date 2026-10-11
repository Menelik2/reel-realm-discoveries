import { useEffect, useState } from 'react';
import { Search, Menu, X, Moon, Sun, Film, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { ActorSearch } from '@/components/ActorSearch';
import { InstallPrompt } from '@/components/InstallPrompt';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useScrollHide } from '@/hooks/useScrollHide';

const TELEGRAM_CHANNEL = 'https://t.me/yenimovie';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const Header = ({ searchQuery, setSearchQuery, isDarkMode, setIsDarkMode }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const isHidden = useScrollHide({
    forceVisible: isMobileMenuOpen || isSearchOverlayOpen,
    threshold: 6,
    topOffset: 80,
  });

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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/?type=movie', label: 'Movies' },
    { to: '/?type=tv', label: 'TV Series' },
    { to: '/franchises', label: 'Franchises' },
    { to: '/top-box-office', label: 'Box Office' },
  ];

  return (
    <>
      <header
        className={
          'fixed top-0 left-0 right-0 z-50 w-full ' +
          'bg-background/80 backdrop-blur-2xl border-b border-border/40 ' +
          'supports-[backdrop-filter]:bg-background/70 ' +
          'transition-transform duration-300 ease-out will-change-transform ' +
          (isHidden ? '-translate-y-full' : 'translate-y-0')
        }
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Film className="h-4.5 w-4.5 text-primary-foreground" style={{ width: 18, height: 18 }} />
              </div>
              <span className="font-playfair text-xl font-bold tracking-tight text-foreground">
                YENI<span className="text-primary">MOVIE</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center flex-1 max-w-xs mx-5">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search movies & shows…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-secondary/40 border-border/40 rounded-full text-sm focus-visible:ring-primary/25 focus-visible:border-primary/30 shadow-sm"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={TELEGRAM_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1c8bbd] transition-colors shadow-sm shadow-[#229ED9]/25"
                aria-label="Join our Telegram channel"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Join Channel</span>
              </a>

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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search movies & shows…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-secondary/40 border-border/40 rounded-full text-sm shadow-sm"
              />
            </div>
          </div>

          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-border/40 pt-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-0.5">
                {[...navLinks, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }, { to: '/privacy', label: 'Privacy' }].map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href={TELEGRAM_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-[#229ED9] hover:bg-[#229ED9]/10 rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Send className="h-4 w-4" />
                  Join Telegram Channel
                </a>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl transition-all"
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

      <div className="w-full shrink-0 md:h-16 h-[7.25rem]" aria-hidden="true" />
    </>
  );
};
