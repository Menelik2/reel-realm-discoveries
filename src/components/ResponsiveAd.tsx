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
        if (insElement && insElement.getAttribute('data-adsbygoogle-status')) {
          return;
        }
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("Responsive AdSense error:", error);
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
      />
      <div style={{ overflow: 'hidden' }}></div>
    </div>
  );
};