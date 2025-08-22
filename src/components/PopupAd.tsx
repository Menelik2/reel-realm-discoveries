import { useEffect, useState, useRef } from 'react';
import { useAdFreeStatus } from '@/hooks/useAdFreeStatus';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface PopupAdProps {
  onClose?: () => void;
  delay?: number; // Delay in seconds before showing popup
}

export const PopupAd = ({ onClose, delay = 10 }: PopupAdProps) => {
  const { data: isAdFree, isLoading } = useAdFreeStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Don't show if user is ad-free, still loading, or already shown
    if (isAdFree || isLoading || hasShown) return;

    // Check if popup was shown recently (within last hour)
    const lastPopupTime = localStorage.getItem('lastPopupAd');
    if (lastPopupTime) {
      const timeDiff = Date.now() - parseInt(lastPopupTime);
      const oneHour = 60 * 60 * 1000;
      if (timeDiff < oneHour) return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasShown(true);
      localStorage.setItem('lastPopupAd', Date.now().toString());
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isAdFree, isLoading, hasShown, delay]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const isAdSenseReady = () => {
    return typeof window !== 'undefined' && 
           window.adsbygoogle && 
           typeof window.adsbygoogle.push === 'function';
  };

  const pushAd = () => {
    if (!adRef.current || adLoaded || adError) return;

    try {
      // Check if AdSense is ready
      if (!isAdSenseReady()) {
        console.log('AdSense not ready, retrying in 1 second...');
        retryTimeoutRef.current = setTimeout(pushAd, 1000);
        return;
      }

      const insElement = adRef.current.querySelector('ins.adsbygoogle');
      if (!insElement) {
        console.error('Ad element not found');
        setAdError(true);
        return;
      }

      // Check if ad is already loaded
      const adStatus = insElement.getAttribute('data-adsbygoogle-status');
      if (adStatus && adStatus !== 'done') {
        console.log('Ad already being processed');
        return;
      }

      if (adStatus === 'done') {
        console.log('Ad already loaded');
        setAdLoaded(true);
        return;
      }

      // Push ad to AdSense
      window.adsbygoogle.push({});
      console.log('Popup ad pushed to AdSense');
      
      // Monitor ad loading
      const checkAdLoaded = () => {
        const status = insElement.getAttribute('data-adsbygoogle-status');
        if (status === 'done') {
          setAdLoaded(true);
          console.log('Popup ad loaded successfully');
        } else if (status === 'error') {
          setAdError(true);
          console.error('Ad failed to load');
        } else {
          // Keep checking
          setTimeout(checkAdLoaded, 500);
        }
      };
      
      setTimeout(checkAdLoaded, 1000);

    } catch (error: any) {
      console.error("Popup AdSense error:", error);
      setAdError(true);
      
      // Handle specific error cases
      if (error?.message?.includes('already have ads')) {
        console.log('Duplicate ad error - ad already exists');
        setAdLoaded(true);
        return;
      }
    }
  };

  useEffect(() => {
    if (isVisible && !isAdFree && !adLoaded && !adError) {
      // Wait for DOM to be ready and AdSense script to load
      const timer = setTimeout(() => {
        pushAd();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isAdFree, adLoaded, adError]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  if (!isVisible || isAdFree || isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-background border border-border rounded-lg shadow-2xl max-w-md w-full relative">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <span className="text-sm text-muted-foreground">Advertisement</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div ref={adRef} className="p-4 min-h-[250px] flex items-center justify-center">
          {/* Show loading state */}
          {!adLoaded && !adError && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading advertisement...</p>
            </div>
          )}
          
          {/* Show error state */}
          {adError && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Advertisement unavailable</p>
            </div>
          )}
          
          {/* Google AdSense Ad */}
          <ins 
            className="adsbygoogle"
            style={{ 
              display: 'block',
              minWidth: '300px',
              minHeight: '250px'
            }}
            data-ad-client="ca-pub-8938310552882401"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
        
        <div className="p-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Support us by viewing ads - Thank you!
          </p>
        </div>
      </div>
    </div>
  );
};