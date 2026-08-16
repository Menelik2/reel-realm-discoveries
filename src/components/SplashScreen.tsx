import { useEffect, useRef, useState } from 'react';
const SPLASH_LOGO_SRC = '/splash-logo.jpg';

const STORAGE_KEY = 'yeni-splash-seen';
// Bump this string whenever branding/updates change so returning users see the splash again.
const SPLASH_VERSION = '1.0.0';

export function SplashScreen() {
  const [phase, setPhase] = useState<'entering' | 'idle' | 'exiting' | 'done'>('entering');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
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

    const idleDelay = prefersReducedMotion ? 0 : 50;
    const visibleDuration = prefersReducedMotion ? 300 : 700;
    const exitDuration = prefersReducedMotion ? 150 : 350;

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
      // restore focus
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

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'done'}
      className={
        'fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background ' +
        'transition-opacity duration-300 ' +
        (isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100')
      }
    >
      <div className="relative flex items-center justify-center">
        <div
          className={
            'absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150 ' +
            (prefersReducedMotion ? '' : 'animate-pulse')
          }
          aria-hidden
        />
        <img
          src={SPLASH_LOGO_SRC}
          alt="YENI MOVIE"
          width={320}
          height={320}
          decoding="async"
          fetchPriority="high"
          className="relative z-10 block w-[min(320px,72vw)] h-auto object-contain drop-shadow-[0_0_40px_rgba(239,68,68,0.35)]"
        />
      </div>

      <span className="sr-only">Loading YENI MOVIES</span>
    </div>
  );
}
