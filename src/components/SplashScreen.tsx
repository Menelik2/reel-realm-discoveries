import { useEffect, useState } from 'react';
import splashLogo from '@/assets/yeni-splash-logo.jpg.asset.json';

const STORAGE_KEY = 'yeni-splash-seen';

export function SplashScreen() {
  const [phase, setPhase] = useState<'entering' | 'idle' | 'exiting' | 'done'>('entering');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        setPhase('done');
        return;
      }
    } catch {
      // Ignore sessionStorage errors in private/incognito edge cases
    }

    const enterTimer = setTimeout(() => setPhase('idle'), 50);
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Ignore write errors
      }
    }, 2600);
    const doneTimer = setTimeout(() => setPhase('done'), 3200);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  const isIdleOrExiting = phase === 'idle' || phase === 'exiting';
  const isExiting = phase === 'exiting';

  return (
    <div
      className={[
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ease-out',
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
      aria-hidden={isExiting}
    >
      <div
        className={[
          'relative flex items-center justify-center transition-transform duration-700 ease-out',
          isIdleOrExiting ? 'scale-100' : 'scale-90',
        ].join(' ')}
      >
        {/* Animated glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse scale-125" />
        <div className="absolute inset-0 rounded-full border border-primary/40 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        
        {/* Logo image */}
        <img
          src={splashLogo.url}
          alt="YENI MOVIES"
          className="relative z-10 w-[280px] max-w-[80vw] h-auto rounded-full shadow-2xl shadow-primary/20"
        />
      </div>

      <div
        className={[
          'mt-8 text-center transition-all duration-700 ease-out',
          isIdleOrExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        ].join(' ')}
      >
        <p className="text-sm font-medium tracking-[0.3em] text-white/60 uppercase">
          A+ HD Movies
        </p>
      </div>
    </div>
  );
}
