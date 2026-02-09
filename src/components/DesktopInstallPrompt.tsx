import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { toast } from 'sonner';

export const DesktopInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { canInstall, isInstalled, isSupported, install } = usePWAInstall();

  useEffect(() => {
    // Only show on desktop (width >= 768px)
    const isDesktop = window.innerWidth >= 768;
    
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwaInstallDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Show again after 7 days
    if (!isDesktop || (dismissed && daysSinceDismissed < 7)) {
      return;
    }

    // Show prompt after a short delay when supported and not installed
    if (isSupported && !isInstalled) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, isInstalled]);

  const handleInstall = async () => {
    // Try native install prompt first
    const installed = await install();
    
    if (installed) {
      toast.success('App installed successfully!');
      setShowPrompt(false);
      return;
    }
    
    // If native prompt didn't work, show helpful instructions
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    
    if (isChrome) {
      toast.info('To install: Click the ⋮ menu → "Install YENI MOVIE..."', {
        duration: 8000,
        description: 'Or look for the install icon in the address bar',
      });
    } else if (isEdge) {
      toast.info('To install: Click the ⋯ menu → Apps → "Install this site as an app"', {
        duration: 8000,
      });
    } else {
      toast.info('To install: Open browser menu and look for "Install" or "Add to Home Screen"', {
        duration: 8000,
      });
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  if (!showPrompt || !isSupported || isInstalled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:block animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-sm">Install the app</h4>
            <p className="text-muted-foreground text-xs mt-1">
              Get one-click access from your desktop
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleInstall} className="text-xs">
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs">
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
