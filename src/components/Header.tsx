import { useState } from 'react';
import { Search, Menu, X, Moon, Sun, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const Header = ({ searchQuery, setSearchQuery, isDarkMode, setIsDarkMode }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { canInstall, isInstalled, isSupported, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (canInstall) {
      await install();
    } else {
      // Show manual install instructions
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isEdge = /Edg/.test(navigator.userAgent);
      
      let message = 'To install this app:\n\n';
      if (isChrome) {
        message += '1. Click the menu (⋮) in the top right\n2. Select "Install YENI MOVIE..."';
      } else if (isEdge) {
        message += '1. Click the menu (⋯) in the top right\n2. Select "Apps" → "Install this site as an app"';
      } else {
        message += '1. Click the browser menu\n2. Look for "Install" or "Add to Home Screen"';
      }
      alert(message);
    }
  };

  // Show install button if: supported browser AND not installed
  const showInstallButton = isSupported && !isInstalled;

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-playfair text-3xl font-bold text-primary transition-all hover:opacity-80 [text-shadow:0_1px_2px_hsl(var(--foreground)/0.1)]">
            YENI MOVIE
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/?type=movie" className="hover:text-primary transition-colors">Movies</Link>
            <Link to="/?type=tv" className="hover:text-primary transition-colors">TV Series</Link>
            <Link to="/top-box-office" className="hover:text-primary transition-colors">Top Box Office</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Install, Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {showInstallButton && (
              <Button
                variant="default"
                size="sm"
                onClick={handleInstallClick}
                className="hidden md:flex items-center gap-2 text-xs font-medium"
              >
                <Download className="h-3 w-3" />
                <span>Install</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-2 text-xs font-medium"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-3 w-3" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3 w-3" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/?type=movie" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Movies
              </Link>
              <Link 
                to="/?type=tv" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                TV Series
              </Link>
              <Link 
                to="/top-box-office" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Top Box Office
              </Link>
              <Link 
                to="/about" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/privacy" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Privacy
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
