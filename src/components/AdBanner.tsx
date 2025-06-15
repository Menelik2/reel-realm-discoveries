
import { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const AdBanner = ({ slot }: AdBannerProps) => {
  // Ad banners are temporarily disabled to debug a site-wide issue.
  // This component will render nothing until the root cause is fixed.
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Ad banner for slot "${slot}" is disabled for debugging.`);
    }
  }, [slot]);
  
  return null;
};
