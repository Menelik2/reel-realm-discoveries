
import { useState, useEffect } from 'react';
import { AdBanner } from './AdBanner';
import { Button } from './ui/button';
import { X, Loader2 } from 'lucide-react';

interface InterstitialAdProps {
  onContinue: () => void;
  onClose: () => void;
}

export const InterstitialAd = ({ onContinue, onClose }: InterstitialAdProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) return;
    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [countdown]);

  const canContinue = countdown <= 0;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full h-full max-w-5xl max-h-[90vh] bg-background/80 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        <div className="p-2 flex justify-between items-center border-b border-border/20">
          <p className="text-sm text-muted-foreground ml-2">Advertisement</p>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-grow flex items-center justify-center p-4">
          <AdBanner slot="5678901234" format="auto" className="w-full h-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        </div>

        <div className="p-4 border-t border-border/20 text-center">
          <Button onClick={onContinue} disabled={!canContinue} size="lg" className="min-w-[200px]">
            {canContinue ? (
              'Skip Ad'
            ) : (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait {countdown}s...
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
