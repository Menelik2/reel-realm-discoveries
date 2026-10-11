import { useEffect, useRef, useState } from 'react';
import { Film } from 'lucide-react';

const SPLASH_LOGO_SRC = '/splash-logo.jpg';

const STORAGE_KEY = 'yeni-splash-seen';
// Bump this string whenever branding/updates change so returning users see the splash again.
const SPLASH_VERSION = '1.1.0';

export function SplashScreen() {
  const [phase, setPhase] = useState<'entering' | 'idle' | 'exiting' | 'done'>('entering');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      setPrefersReducedMotion(matches);
    };

    if (typeof (mq as any).addEventListener === 'function') {
      (mq as any).addEventListener('change', onChange);
      return () => (mq as any).removeEventListener('change', onChange);
    } else if (typeof (mq as any).addListener === 'function') {
      (mq as any).addListener(onChange);
      return () => (mq as any).removeListener(onChange);
    }

    return;
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === SPLASH_VERSION) {
        setPhase('done');
        return;
      }
    } catch {
      // ignore
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const idleDelay = prefersReducedMotion ? 0 : 40;
    const visibleDuration = prefersReducedMotion ? 280 : 750;
    const exitDuration = prefersReducedMotion ? 140 : 380;

    const enterTimer = window.setTimeout(() => {
      setPhase('idle');
      containerRef.current?.focus();
    }, idleDelay);
    const exitTimer = window.setTimeout(() => {
      setPhase('exiting');
      try {
        sessionStorage.setItem(STORAGE_KEY, SPLASH_VERSION);
      } catch {
        // ignore
      }
    }, visibleDuration);
    const doneTimer = window.setTimeout(() => {
      setPhase('done');
      previouslyFocused.current?.focus?.();
    }, visibleDuration + exitDuration);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [prefersReducedMotion]);

  if (phase === 'done') return null;

  const isExiting = phase === 'exiting';
  const isEntering = phase === 'entering';

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'done'}
      className={
        'fixed inset-0 z-[10000] flex flex-col items-center justify-center ' +
        'bg-background transition-all duration-400 ease-out ' +
        (isExiting ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100')
      }
    >
      {/* Soft ambient glow */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,420px)] h-[min(80vw,420px)] rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div
        className={
          'relative flex flex-col items-center gap-5 transition-all duration-500 ease-out ' +
          (isEntering ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0')
        }
      >
        {logoFailed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30">
              <Film className="h-9 w-9 text-primary-foreground" />
            </div>
            <span className="font-playfair text-2xl font-bold tracking-tight">
              YENI<span className="text-primary">MOVIE</span>
            </span>
          </div>
        ) : (
          <img
            src={SPLASH_LOGO_SRC}
            alt="YENI MOVIE"
            width={320}
            height={320}
            decoding="async"
            fetchPriority="high"
            onError={() => setLogoFailed(true)}
            className="relative z-10 block w-[min(280px,68vw)] h-auto object-contain drop-shadow-[0_0_48px_rgba(239,68,68,0.3)]"
          />
        )}

        {/* Subtle progress line */}
        <div className="w-16 h-0.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={
              'h-full rounded-full bg-primary ' +
              (prefersReducedMotion ? 'w-full' : 'animate-[splash-progress_0.7s_ease-out_forwards]')
            }
            style={
              prefersReducedMotion
                ? undefined
                : {
                    animation: 'splash-progress 0.7s ease-out forwards',
                  }
            }
          />
        </div>
      </div>

      <span className="sr-only">Loading YENI MOVIE</span>

      <style>{`
        @keyframes splash-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
