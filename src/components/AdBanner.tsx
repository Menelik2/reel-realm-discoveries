
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdFreeStatus } from '@/hooks/useAdFreeStatus';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { adManager } from '@/utils/adManager';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  slot: string;
  format?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const AdBanner = ({ slot, className, format = 'auto', style = { display: 'block' } }: AdBannerProps) => {
  const { user } = useAuth();
  const { data: isAdFree, isLoading: isStatusLoading } = useAdFreeStatus();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);

  const initializeAd = useCallback(() => {
    // Prevent multiple initializations
    if (initializationRef.current || adManager.isSlotInitialized(slot)) {
      console.log(`Ad slot ${slot} already initialized, skipping`);
      setAdLoaded(true);
      return;
    }

    try {
      if (!window.adsbygoogle || isAdFree || isStatusLoading || !adRef.current) {
        return;
      }

      // Check if this element already has an ad
      const insElement = adRef.current.querySelector('ins.adsbygoogle[data-adsbygoogle-status]');
      if (insElement) {
        console.log(`Element already has processed ad for slot: ${slot}`);
        setAdLoaded(true);
        adManager.markSlotAsInitialized(slot);
        initializationRef.current = true;
        return;
      }

      // Mark as initializing to prevent race conditions
      initializationRef.current = true;
      adManager.markSlotAsInitialized(slot);
      
      // Push the ad
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setAdLoaded(true);
      console.log(`Ad successfully pushed for slot: ${slot}`);

    } catch (error: any) {
      console.error("AdSense error for slot", slot, ":", error);
      
      // Handle TagError specifically
      if (error?.name === 'TagError' && error?.message?.includes('already have ads')) {
        console.log(`TagError detected for slot: ${slot}, marking as loaded`);
        setAdLoaded(true);
        return;
      }
      
      // Reset for other errors
      initializationRef.current = false;
      adManager.resetSlot(slot);
      setAdError(true);
    }
  }, [slot, isAdFree, isStatusLoading]);

  // Single initialization effect using IntersectionObserver for better performance
  useEffect(() => {
    if (isAdFree || isStatusLoading || !adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !initializationRef.current && !adLoaded && !adError) {
            // Small delay to ensure DOM is stable
            setTimeout(initializeAd, 50);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [isAdFree, isStatusLoading, adLoaded, adError, initializeAd]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      initializationRef.current = false;
      adManager.cleanupSlot(slot);
    };
  }, [slot]);

  const handlePurchase = async () => {
    setIsRedirecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session');
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to create payment session:', error);
      setIsRedirecting(false);
    }
  };

  if (isStatusLoading) {
    return <div className={`flex justify-center items-center ${className}`} style={{ height: '90px', ...style }}>
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }
  
  if (isAdFree) {
    return null;
  }

  return (
    <div ref={adRef} className={`relative ${className}`}>
      <ins 
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-8938310552882401"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-adtest={process.env.NODE_ENV === 'development' ? 'on' : 'off'}
      />
      
      {/* Loading indicator for ads */}
      {!adLoaded && !adError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {/* Error state */}
      {adError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded">
          <p className="text-xs text-muted-foreground">Ad temporarily unavailable</p>
        </div>
      )}
      
      {user && (
         <div className="absolute bottom-2 right-2 z-10">
           <Button 
            size="sm" 
            variant="secondary"
            onClick={handlePurchase}
            disabled={isRedirecting}
           >
            {isRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Remove Ads ($5)
           </Button>
         </div>
      )}
    </div>
  );
};
