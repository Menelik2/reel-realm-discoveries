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

    // Support both modern addEventListener and legacy addListener APIs.
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // Some browsers call the listener with a MediaQueryListEvent, others (legacy)
      // call it with the MediaQueryList as the argument — handle both.
      const matches = 'matches' in e ? e.matches : mq.matches;
      setPrefersReducedMotion(matches);
    };

    if (typeof (mq as any).addEventListener === 'function') {
      // modern browsers
      (mq as any).addEventListener('change', onChange);
      return () => (mq as any).removeEventListener('change', onChange);
    } else if (typeof (mq as any).addListener === 'function') {
      // legacy Safari / older browsers
      (mq as any).addListener(onChange);
      return () => (mq as any).removeListener(onChange);
    }

    // Fallback: no listener API
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

    // Save current focus and move focus to splash so screen readers announce it
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const idleDelay = prefersReducedMotion ? 0 : 50;
    const visibleDuration = prefersReducedMotion ? 1200 : 2600;
    const exitDuration = prefersReducedMotion ? 200 : 600;

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
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [prefersReducedMotion]);

  // Allow dismissing with Escape for keyboard users
  useEffect(() => {
    if (phase === 'done') return;
    let escapeTimer: number | undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhase('exiting');
        try {
          sessionStorage.setItem(STORAGE_KEY, SPLASH_VERSION);
        } catch {
          // ignore
        }
        // match previous behavior; make timer cancelable to avoid leaks
        escapeTimer = window.setTimeout(() => {
          setPhase('done');
          previouslyFocused.current?.focus?.();
        }, 300);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (escapeTimer) clearTimeout(escapeTimer);
    };
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
          src={SPLASH_LOGO_SRC}
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
