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
  const adRef = useRef<HTMLDivElement>(null);

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

  const pushAd = () => {
    try {
      if (window.adsbygoogle && adRef.current) {
        // Check if ad is already initialized to prevent duplicate initialization
        const insElement = adRef.current.querySelector('ins.adsbygoogle');
        if (insElement && insElement.getAttribute('data-adsbygoogle-status')) {
          console.log('Popup ad already loaded');
          return;
        }
        
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('Popup ad pushed');
      }
    } catch (error) {
      console.error("Popup AdSense error:", error);
      // Don't retry if it's a duplicate ad error
      if (error.message && error.message.includes('already have ads')) {
        return;
      }
    }
  };

  useEffect(() => {
    if (isVisible && !isAdFree) {
      const timer = setTimeout(() => {
        pushAd();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isAdFree]);

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
        
        <div ref={adRef} className="p-4">
          {/* YENI NEW ADS */}
          <ins 
            className="adsbygoogle"
            style={{ 
              display: 'block'
            }}
            data-ad-client="ca-pub-8938310552882401"
            data-ad-slot="9876543210"
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