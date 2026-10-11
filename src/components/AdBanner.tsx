
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

export const AdBanner = ({ slot, className, format = 'auto', style }: AdBannerProps) => {
  const { user } = useAuth();
  const { data: isAdFree, isLoading: isStatusLoading } = useAdFreeStatus();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [isUnfilled, setIsUnfilled] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  const checkFilled = useCallback(() => {
    if (!adRef.current) return;
    const ins = adRef.current.querySelector('ins.adsbygoogle');
    if (!ins) return;
    const status = ins.getAttribute('data-ad-status');
    if (status === 'unfilled') {
      setIsUnfilled(true);
      return;
    }
    // Also hide if iframe exists but has near-zero height (common empty fill)
    const iframe = ins.querySelector('iframe');
    if (status === 'filled' || (iframe && iframe.clientHeight > 40)) {
      setAdLoaded(true);
      setIsUnfilled(false);
    }
  }, []);

  const pushAd = useCallback(() => {
    try {
      if (adManager.isSlotInitialized(slot)) {
        setAdLoaded(true);
        return;
      }

      if (window.adsbygoogle && !isAdFree && !isStatusLoading && adRef.current) {
        const insElement = adRef.current.querySelector('ins.adsbygoogle');
        if (insElement && insElement.getAttribute('data-adsbygoogle-status')) {
          setAdLoaded(true);
          adManager.markSlotAsInitialized(slot);
          setTimeout(checkFilled, 400);
          return;
        }

        const existingIns = adRef.current.querySelectorAll('ins.adsbygoogle');
        if (existingIns.length > 1) {
          for (let i = 1; i < existingIns.length; i++) {
            existingIns[i].remove();
          }
        }

        adManager.markSlotAsInitialized(slot);

        setTimeout(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
            // Poll for fill status — hide if unfilled
            setTimeout(checkFilled, 500);
            setTimeout(checkFilled, 1500);
            setTimeout(checkFilled, 3000);
          } catch (pushError: unknown) {
            console.error('AdSense push error for slot', slot, ':', pushError);
            adManager.resetSlot(slot);
            setAdError(true);
          }
        }, 50);
      }
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string };
      if (err?.message?.includes('already have ads') || err?.name === 'TagError') {
        setAdLoaded(true);
        adManager.markSlotAsInitialized(slot);
        setTimeout(checkFilled, 400);
        return;
      }

      adManager.resetSlot(slot);
      setAdError(true);

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setTimeout(() => {
          setAdError(false);
          pushAd();
        }, 800 * retryCountRef.current);
      }
    }
  }, [slot, isAdFree, isStatusLoading, checkFilled]);

  useEffect(() => {
    if (!isAdFree && !isStatusLoading) {
      const timer = setTimeout(() => pushAd(), 120);
      return () => clearTimeout(timer);
    }
  }, [slot, isAdFree, isStatusLoading, pushAd]);

  useEffect(() => {
    return () => {
      adManager.cleanupSlot(slot);
    };
  }, [slot]);

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

  // Watch for AdSense status attribute changes
  useEffect(() => {
    if (!adRef.current) return;
    const ins = adRef.current.querySelector('ins.adsbygoogle');
    if (!ins) return;

    const mo = new MutationObserver(() => checkFilled());
    mo.observe(ins, { attributes: true, attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'] });
    return () => mo.disconnect();
  }, [adLoaded, checkFilled]);

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

  // Ad-free users: render nothing
  if (isAdFree) return null;

  // Still checking premium status — no layout jump
  if (isStatusLoading) return null;

  // Failed after retries or confirmed unfilled — collapse completely (no white box)
  if (isUnfilled || (adError && retryCountRef.current >= maxRetries)) {
    return null;
  }

  return (
    <div
      ref={adRef}
      className={`relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 ${className || ''}`}
      style={{
        minHeight: adLoaded ? undefined : 100,
        width: '100%',
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: 100,
        }}
        data-ad-client="ca-pub-8938310552882401"
        data-ad-slot={slot}
        data-ad-format={format || 'auto'}
        data-full-width-responsive="true"
      />

      {!adLoaded && !adError && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/60 pointer-events-none">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Loading advertisement</span>
        </div>
      )}

      {user && adLoaded && !isUnfilled && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePurchase}
            disabled={isRedirecting}
            className="shadow-md h-8 text-xs rounded-full"
          >
            {isRedirecting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            Remove Ads
          </Button>
        </div>
      )}
    </div>
  );
};
