
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdFreeStatus } from '@/hooks/useAdFreeStatus';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (!isAdFree && !isStatusLoading) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [slot, isAdFree, isStatusLoading]);

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
    <div className={`relative ${className}`}>
      <ins className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-8938310552882401"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"></ins>
      {user && (
         <div className="absolute bottom-2 right-2">
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
