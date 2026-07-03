import { useEffect, useRef, useState } from 'react';
import splashLogo from '@/assets/yeni-splash-logo.jpg.asset.json';

const STORAGE_KEY = 'yeni-splash-seen';

export function SplashScreen() {
  const [phase, setPhase] = useState<'entering' | 'idle' | 'exiting' | 'done'>('entering');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        setPhase('done');
        return;
      }
    } catch {
      // ignore
    }

    // Save current focus and move focus to splash so screen readers announce it
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const idleDelay = prefersReducedMotion ? 0 : 50;
    const visibleDuration = prefersReducedMotion ? 1200 : 2600;
    const exitDuration = prefersReducedMotion ? 200 : 600;

    const enterTimer = setTimeout(() => {
      setPhase('idle');
      containerRef.current?.focus();
    }, idleDelay);
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // ignore
      }
    }, visibleDuration);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      previouslyFocused.current?.focus?.();
    }, visibleDuration + exitDuration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [prefersReducedMotion]);

  // Allow dismissing with Escape for keyboard users
  useEffect(() => {
    if (phase === 'done') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhase('exiting');
        try {
          sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
          // ignore
        }
        setTimeout(() => {
          setPhase('done');
          previouslyFocused.current?.focus?.();
        }, 300);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  if (phase === 'done') return null;

  const isIdleOrExiting = phase === 'idle' || phase === 'exiting';
  const isExiting = phase === 'exiting';

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="YENI MOVIES loading screen"
      aria-live="polite"
      aria-busy={!isExiting}
      tabIndex={-1}
      className={[
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black outline-none',
        prefersReducedMotion ? '' : 'transition-opacity duration-700 ease-out',
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
      aria-hidden={isExiting}
    >
      <div
        className={[
          'relative flex items-center justify-center',
          prefersReducedMotion ? '' : 'transition-transform duration-700 ease-out',
          isIdleOrExiting || prefersReducedMotion ? 'scale-100' : 'scale-90',
        ].join(' ')}
      >
        {/* Animated glow ring - hidden for reduced motion */}
        {!prefersReducedMotion && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-full bg-primary/25 blur-3xl animate-pulse scale-125"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-primary/40 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"
            />
          </>
        )}

        {/* Logo image */}
        <img
          src={splashLogo.url}
          alt="YENI MOVIES"
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
