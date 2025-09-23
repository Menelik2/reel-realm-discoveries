
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
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const pushAd = useCallback(() => {
    try {
      // Skip if already processing this slot
      if (adManager.isSlotInitialized(slot)) {
        console.log(`Ad slot ${slot} already initialized, skipping`);
        setAdLoaded(true);
        return;
      }

      if (window.adsbygoogle && !isAdFree && !isStatusLoading && adRef.current) {
        // Check if the current ad element already has ads
        const insElement = adRef.current.querySelector('ins.adsbygoogle');
        if (insElement && insElement.getAttribute('data-adsbygoogle-status')) {
          console.log(`Current element already has processed ad for slot: ${slot}, skipping`);
          setAdLoaded(true);
          adManager.markSlotAsInitialized(slot);
          return;
        }

        // Ensure we only have one ins element per container
        const existingIns = adRef.current.querySelectorAll('ins.adsbygoogle');
        if (existingIns.length > 1) {
          // Remove extra ins elements
          for (let i = 1; i < existingIns.length; i++) {
            existingIns[i].remove();
          }
        }

        // Mark as initialized BEFORE pushing to prevent race conditions
        adManager.markSlotAsInitialized(slot);
        
        // Initialize the ad with a small delay to ensure DOM is ready
        setTimeout(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
            console.log(`Ad successfully pushed for slot: ${slot}`);
          } catch (pushError) {
            console.error("AdSense push error for slot", slot, ":", pushError);
            adManager.resetSlot(slot);
            setAdError(true);
          }
        }, 50);
      }
    } catch (error) {
      console.error("AdSense error for slot", slot, ":", error);
      
      // Handle the specific duplicate ad error
      if (error?.message?.includes('already have ads') || error?.name === 'TagError') {
        console.log(`TagError detected for slot: ${slot}, setting as loaded`);
        setAdLoaded(true);
        adManager.markSlotAsInitialized(slot);
        return;
      }
      
      // Reset slot for other errors and potentially retry
      adManager.resetSlot(slot);
      setAdError(true);
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        console.log(`Retrying ad initialization for slot: ${slot}, attempt: ${retryCountRef.current}`);
        setTimeout(() => {
          setAdError(false);
          pushAd();
        }, 1000 * retryCountRef.current);
      }
    }
  }, [slot, isAdFree, isStatusLoading]);

  useEffect(() => {
    if (!isAdFree && !isStatusLoading) {
      // Small delay to ensure DOM is ready and avoid race conditions
      const timer = setTimeout(() => {
        pushAd();
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [slot, isAdFree, isStatusLoading, pushAd]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clean up this specific slot to prevent conflicts on remount
      adManager.cleanupSlot(slot);
    };
  }, [slot]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!adRef.current || isAdFree || isStatusLoading || adManager.isSlotInitialized(slot)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !adLoaded && !adError && !adManager.isSlotInitialized(slot)) {
            pushAd();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(adRef.current);

    return () => observer.disconnect();
  }, [isAdFree, isStatusLoading, adLoaded, adError, slot, pushAd]);

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
    <div ref={adRef} className={`relative bg-background border border-border rounded-lg overflow-hidden ${className}`} 
         style={{ minHeight: '280px', width: '100%' }}>
      <ins 
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: '280px',
          width: '100%',
          ...style 
        }}
        data-ad-client="ca-pub-8938310552882401"
        data-ad-slot={slot}
        data-ad-format="rectangle"
        data-full-width-responsive="true"
        data-adtest={process.env.NODE_ENV === 'development' ? 'on' : 'off'}
      />
      
      {/* Loading indicator for ads */}
      {!adLoaded && !adError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading advertisement...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {adError && retryCountRef.current >= maxRetries && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
            </div>
            <p className="text-sm text-muted-foreground">Advertisement space</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Content loading temporarily unavailable</p>
          </div>
        </div>
      )}
      
      {user && (
         <div className="absolute top-2 right-2 z-10">
           <Button 
            size="sm" 
            variant="secondary"
            onClick={handlePurchase}
            disabled={isRedirecting}
            className="shadow-md"
           >
            {isRedirecting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
             Remove Ads ($5)
           </Button>
         </div>
      )}
    </div>
  );
};
