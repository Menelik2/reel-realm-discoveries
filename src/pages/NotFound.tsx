import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Film, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark =
      stored !== null
        ? stored === 'true'
        : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const root = document.documentElement;
    const body = document.body;
    if (prefersDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, []);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 pb-24">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Film className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-6xl font-playfair font-bold text-primary tabular-nums tracking-tight">404</p>
            <h1 className="text-xl font-semibold mt-2 tracking-tight">Page not found</h1>
            <p className="text-sm text-muted-foreground mt-2">
              The page you’re looking for doesn’t exist or has been moved.
            </p>
          </div>
          <Button asChild className="rounded-full h-11 px-6 gap-2 shadow-md shadow-primary/20">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
};

export default NotFound;
