import { useEffect, useRef } from 'react';
import { useAdFreeStatus } from '@/hooks/useAdFreeStatus';

interface ResponsiveAdProps {
  slot: string;
  className?: string;
}

export const ResponsiveAd = ({ slot, className = "" }: ResponsiveAdProps) => {
  const { data: isAdFree, isLoading } = useAdFreeStatus();
  const adRef = useRef<HTMLDivElement>(null);

  const pushAd = () => {
    try {
      if (window.adsbygoogle && !isAdFree && !isLoading && adRef.current) {
        const insElement = adRef.current.querySelector('ins.adsbygoogle');
        if (!insElement) {
          console.error(`Responsive ad element not found for slot: ${slot}`);
          return;
        }

        // Check for any existing status or processing flag
        const adStatus = insElement.getAttribute('data-adsbygoogle-status');
        const isProcessed = insElement.hasAttribute('data-ad-processed');
        
        if (adStatus || isProcessed) {
          console.log(`Responsive ad already processed for slot: ${slot}`);
          return;
        }

        // Mark as processed to prevent duplicate processing
        insElement.setAttribute('data-ad-processed', 'true');
        
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`Responsive ad pushed for slot: ${slot}`);
      }
    } catch (error: any) {
      console.error(`Responsive AdSense error for slot ${slot}:`, error);
      
      // Handle duplicate ad errors gracefully
      if (error?.message?.includes('already have ads') || error?.message?.includes('TagError')) {
        console.log(`Duplicate responsive ad detected for slot: ${slot}`);
      }
    }
  };

  useEffect(() => {
    if (!isAdFree && !isLoading) {
      const timer = setTimeout(() => {
        pushAd();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [slot, isAdFree, isLoading]);

  if (isAdFree || isLoading) return null;

  return (
    <div ref={adRef} className={`w-full ${className}`}>
      <ins 
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: '100%',
          height: '320px'
        }}
        data-ad-client="ca-pub-8938310552882401"
        data-ad-slot={slot}
        data-auto-format="rspv"
        data-full-width-responsive="true"
        data-ad-format="auto"
        key={`responsive-ad-${slot}-${Date.now()}`}
      />
      <div style={{ overflow: 'hidden' }}></div>
    </div>
  );
};