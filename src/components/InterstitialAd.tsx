import { useState, useEffect, useRef } from 'react';
import { AdBanner } from './AdBanner';
import { Button } from './ui/button';
import { X, Loader2 } from 'lucide-react';

interface InterstitialAdProps {
  onContinue: () => void;
  onClose: () => void;
}

export const InterstitialAd = ({ onContinue, onClose }: InterstitialAdProps) => {
  const [countdown, setCountdown] = useState(5);
  const [adLoaded, setAdLoaded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    
    const timerId = setTimeout(() => {
      if (mountedRef.current) {
        setCountdown(countdown - 1);
      }
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [countdown]);

  // Auto-close after a maximum time if user doesn't interact
  useEffect(() => {
    const autoCloseTimer = setTimeout(() => {
      if (mountedRef.current) {
        onContinue();
      }
    }, 30000); // 30 seconds max

    return () => clearTimeout(autoCloseTimer);
  }, [onContinue]);

  const canContinue = countdown <= 0;

  const handleContinue = () => {
    console.log('Interstitial ad - Continue clicked');
    onContinue();
  };

  const handleClose = () => {
    console.log('Interstitial ad - Close clicked');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full h-full max-w-5xl max-h-[90vh] bg-background/95 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-border/20">
        <div className="p-2 flex justify-between items-center border-b border-border/20 bg-background/80">
          <p className="text-sm text-muted-foreground ml-2">Advertisement</p>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-muted/50">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-grow flex items-center justify-center p-4 bg-gradient-to-br from-background/50 to-muted/20">
          <div className="w-full h-full max-w-4xl max-h-[60vh] relative">
            <AdBanner 
              slot="5678901234" 
              format="auto" 
              className="w-full h-full flex items-center justify-center" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '300px'
              }} 
            />
          </div>
        </div>

        <div className="p-4 border-t border-border/20 text-center bg-background/80">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={handleContinue} 
              disabled={!canContinue} 
              size="lg" 
              className="min-w-[200px] bg-primary hover:bg-primary/90"
            >
              {canContinue ? (
                'Continue to Content'
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait {countdown}s...
                </>
              )}
            </Button>
            
            {canContinue && (
              <p className="text-xs text-muted-foreground">
                Thank you for supporting our free content
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
