/**
 * Capture-phase click / pointer / touch listeners for the Watch Now shell.
 * Prevents host-page and overlay clicks from opening new tabs or hitting
 * the embed until the parent marks the player as unlocked.
 */

export type PlayerUnlockState = {
  /** true after the required Play taps */
  isUnlocked: () => boolean;
};

const ALLOW_SELECTOR =
  'button, [role="button"], a, input, select, textarea, label, [data-player-allow-click="true"]';

function isAllowedControl(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return !!target.closest(ALLOW_SELECTOR);
}

function isInPlayerRoot(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return !!target.closest('[data-video-player-root="true"]');
}

/**
 * Attach capture listeners on the player root element.
 * Returns a cleanup function.
 */
export function attachPlayerClickListeners(
  root: HTMLElement,
  state: PlayerUnlockState
): () => void {
  const blockIfLocked = (e: Event) => {
    if (state.isUnlocked()) return;

    // Allow our own Play / Back / Fullscreen controls
    if (isAllowedControl(e.target)) return;

    // Block everything else inside the player while locked
    if (isInPlayerRoot(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };

  const opts: AddEventListenerOptions = { capture: true, passive: false };

  const types: (keyof HTMLElementEventMap)[] = [
    'click',
    'mousedown',
    'mouseup',
    'pointerdown',
    'pointerup',
    'touchstart',
    'touchend',
    'dblclick',
    'contextmenu',
  ];

  types.forEach((type) => {
    root.addEventListener(type, blockIfLocked, opts);
  });

  return () => {
    types.forEach((type) => {
      root.removeEventListener(type, blockIfLocked, opts);
    });
  };
}

/**
 * Global document capture listeners while Watch Now is open.
 * Blocks new-tab style activations on the host document.
 */
export function attachDocumentClickListeners(): () => void {
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element | null;
    if (!t) return;

    // Ignore pure player chrome (handled separately)
    if (t.closest?.('[data-video-player-root="true"]')) {
      // Still block plain anchors inside player chrome that try _blank
      const a = t.closest('a') as HTMLAnchorElement | null;
      if (a) {
        const target = a.getAttribute('target') || '';
        if (target === '_blank' || target === '_new' || e.ctrlKey || e.metaKey || e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
      return;
    }

    const a = t.closest?.('a') as HTMLAnchorElement | null;
    if (!a) return;

    const href = a.getAttribute('href') || '';
    const target = a.getAttribute('target') || '';

    if (
      target === '_blank' ||
      target === '_new' ||
      e.button === 1 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      href.startsWith('http')
    ) {
      // Only block external while player modal flag is set
      if (document.body.hasAttribute('data-video-modal-open')) {
        try {
          const url = new URL(href, window.location.href);
          if (url.origin !== window.location.origin || target === '_blank' || target === '_new') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
        } catch {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  };

  const onAuxClick = (e: MouseEvent) => {
    if (!document.body.hasAttribute('data-video-modal-open')) return;
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };

  const opts: AddEventListenerOptions = { capture: true, passive: false };

  document.addEventListener('click', onClick, opts);
  document.addEventListener('auxclick', onAuxClick, opts);
  document.addEventListener('mousedown', onAuxClick, opts);

  return () => {
    document.removeEventListener('click', onClick, opts);
    document.removeEventListener('auxclick', onAuxClick, opts);
    document.removeEventListener('mousedown', onAuxClick, opts);
  };
}
