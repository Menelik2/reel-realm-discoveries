import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

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
    if (canInstall) {
      await install();
    } else {
      // Show manual instructions
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
