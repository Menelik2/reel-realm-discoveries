import { useEffect, useRef, useState } from 'react';

interface UseScrollHideOptions {
  /** Keep chrome visible when true (e.g. menu open) */
  forceVisible?: boolean;
  /** Min scroll delta before toggling (px) */
  threshold?: number;
  /** Always show when scrollY is below this (px) */
  topOffset?: number;
}

/**
 * Hide UI chrome when scrolling down; show when scrolling up.
 * Works on mobile (touch) and desktop via window scroll + rAF.
 */
export function useScrollHide(options: UseScrollHideOptions = {}) {
  const {
    forceVisible = false,
    threshold = 6,
    topOffset = 48,
  } = options;

  const [isHidden, setIsHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (forceVisible) {
      setIsHidden(false);
    }
  }, [forceVisible]);

  useEffect(() => {
    const getY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    lastY.current = getY();

    const update = () => {
      const currentY = getY();
      const delta = currentY - lastY.current;

      if (forceVisible || currentY < topOffset) {
        setIsHidden(false);
      } else if (delta > threshold) {
        setIsHidden(true);
      } else if (delta < -threshold) {
        setIsHidden(false);
      }

      lastY.current = currentY < 0 ? 0 : currentY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(update);
      }
    };

    // scroll + touchmove helps some mobile browsers
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchmove', onScroll);
    };
  }, [forceVisible, threshold, topOffset]);

  return isHidden;
}
