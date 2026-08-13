/**
 * Ad injection prevention for the parent page while video embeds are open.
 * Note: cross-origin iframe interiors cannot be fully controlled; this guards
 * the host page against popups, redirects, and injected ad nodes/scripts.
 */

const AD_HOST_PATTERNS: RegExp[] = [
  /doubleclick\.net/i,
  /googlesyndication\.com/i,
  /googleadservices\.com/i,
  /googletagservices\.com/i,
  /pagead2\.googlesyndication/i,
  /adservice\.google/i,
  /adnxs\.com/i,
  /adsrvr\.org/i,
  /advertising\.com/i,
  /adform\.net/i,
  /adsafeprotected\.com/i,
  /moatads\.com/i,
  /scorecardresearch\.com/i,
  /taboola\.com/i,
  /outbrain\.com/i,
  /propellerads/i,
  /popads\.net/i,
  /popcash\.net/i,
  /richpush/i,
  /push-sdk/i,
  /exoclick\.com/i,
  /exosrv\.com/i,
  /juicyads\.com/i,
  /trafficjunky\.net/i,
  /stripchat\.com/i,
  /highperformanceformat\.com/i,
  /onclicka\.com/i,
  /onclickmega\.com/i,
  /clickadu\.com/i,
  /adsterra/i,
  /mgid\.com/i,
  /revcontent\.com/i,
  /yandex\.ru\/ads/i,
  /yandex\.com\/ads/i,
  /amazon-adsystem\.com/i,
  /media\.net/i,
  /criteo\.com/i,
  /rubiconproject\.com/i,
  /pubmatic\.com/i,
  /openx\.net/i,
  /casalemedia\.com/i,
  /smartadserver\.com/i,
  /yieldmo\.com/i,
  /sharethrough\.com/i,
  /zedo\.com/i,
  /adblade\.com/i,
  /adcolony\.com/i,
  /unityads\.unity3d\.com/i,
  /applovin\.com/i,
  /inmobi\.com/i,
  /ironsrc\.com/i,
  /vungle\.com/i,
  /chartboost\.com/i,
];

const SUSPICIOUS_ATTR = /ads?|banner|popup|popunder|sponsor|tracker|clickunder/i;

let activeCount = 0;
let installed = false;
let observer: MutationObserver | null = null;

let originalOpen: typeof window.open | null = null;
let originalCreateElement: typeof document.createElement | null = null;

function isAdUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = url.startsWith("//") ? `https:${url}` : url;
    const host = new URL(u, window.location.href).hostname;
    return AD_HOST_PATTERNS.some((re) => re.test(host) || re.test(u));
  } catch {
    return AD_HOST_PATTERNS.some((re) => re.test(url));
  }
}

function isInsidePlayer(node: Node): boolean {
  const el = node instanceof Element ? node : node.parentElement;
  if (!el) return false;
  return !!el.closest?.('[data-video-player-root="true"]');
}

function shouldRemoveElement(el: Element): boolean {
  if (isInsidePlayer(el)) return false;

  // Never strip our own app root / known UI
  if (el.id === "root" || el.closest?.("#root") === el) return false;

  const tag = el.tagName;

  if (tag === "SCRIPT") {
    const src = el.getAttribute("src");
    if (isAdUrl(src)) return true;
    const text = (el.textContent || "").slice(0, 500);
    if (/adsbygoogle|popunder|onclick|pushNotification|Notification\.requestPermission/i.test(text)) {
      return true;
    }
  }

  if (tag === "IFRAME") {
    const src = el.getAttribute("src") || "";
    // Allow known embed hosts used by the player
    if (/vidsrc\.|embeds?\.|player\./i.test(src)) return false;
    if (isAdUrl(src)) return true;
    // Floating full-screen ad iframes injected into body
    const style = (el as HTMLElement).style;
    if (
      style &&
      (style.position === "fixed" || style.position === "absolute") &&
      (parseInt(style.zIndex || "0", 10) > 1000 || style.width === "100%" || style.height === "100%")
    ) {
      if (!src.includes(window.location.hostname)) return true;
    }
  }

  if (tag === "INS" && el.classList.contains("adsbygoogle")) {
    // Leave intentional site ads alone if marked
    if (el.getAttribute("data-app-ad") === "true") return false;
    return true;
  }

  // Generic fixed overlay pop layers outside player
  if (tag === "DIV" || tag === "SECTION" || tag === "ASIDE") {
    const idClass = `${el.id} ${el.className}`;
    if (SUSPICIOUS_ATTR.test(idClass)) {
      const style = window.getComputedStyle(el);
      if (style.position === "fixed" && parseInt(style.zIndex || "0", 10) > 9999) {
        return true;
      }
    }
  }

  return false;
}

function scrubNode(node: Node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (shouldRemoveElement(el)) {
    el.remove();
    return;
  }
  // Check children of added subtrees
  el.querySelectorAll?.("script, iframe, ins.adsbygoogle").forEach((child) => {
    if (shouldRemoveElement(child)) child.remove();
  });
}

function installHooks() {
  if (installed) return;
  installed = true;

  originalOpen = window.open.bind(window);
  window.open = function blockedOpen(..._args: any[]) {
    if (activeCount > 0) {
      return null;
    }
    return originalOpen ? originalOpen(...(_args as Parameters<typeof window.open>)) : null;
  } as typeof window.open;

  originalCreateElement = document.createElement.bind(document);
  document.createElement = function guardedCreateElement(
    tagName: string,
    options?: ElementCreationOptions
  ) {
    const el = originalCreateElement!(tagName, options) as HTMLElement;

    if (activeCount > 0 && typeof tagName === "string") {
      const tag = tagName.toLowerCase();

      if (tag === "script") {
        const desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
        if (desc?.set) {
          Object.defineProperty(el, "src", {
            configurable: true,
            enumerable: true,
            get() {
              return desc.get?.call(this) ?? "";
            },
            set(value: string) {
              if (isAdUrl(value)) {
                console.debug("[adInjectionGuard] blocked script:", value);
                return;
              }
              desc.set!.call(this, value);
            },
          });
        }
      }

      if (tag === "iframe") {
        const desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
        if (desc?.set) {
          Object.defineProperty(el, "src", {
            configurable: true,
            enumerable: true,
            get() {
              return desc.get?.call(this) ?? "";
            },
            set(value: string) {
              if (isAdUrl(value)) {
                console.debug("[adInjectionGuard] blocked iframe:", value);
                return;
              }
              desc.set!.call(this, value);
            },
          });
        }
      }
    }

    return el as any;
  } as typeof document.createElement;

  observer = new MutationObserver((mutations) => {
    if (activeCount <= 0) return;
    for (const m of mutations) {
      m.addedNodes.forEach((node) => scrubNode(node));
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Capture-phase blockers for common ad open patterns
  document.addEventListener(
    "click",
    (e) => {
      if (activeCount <= 0) return;
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      if (isInsidePlayer(a)) return;
      const href = a.href || "";
      if (a.target === "_blank" || isAdUrl(href)) {
        // Only block if not our app UI
        if (!a.closest("#root") || isAdUrl(href)) {
          if (isAdUrl(href) || a.getAttribute("data-ad-link") === "true") {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    },
    true
  );

  document.addEventListener(
    "auxclick",
    (e) => {
      if (activeCount <= 0) return;
      if (e.button === 1) {
        // middle click often used for popunders
        const t = e.target as HTMLElement | null;
        if (t?.closest?.("a[target=\"_blank\"]")) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    true
  );
}

/** Call when Watch Now / embed player opens */
export function activateAdInjectionGuard() {
  installHooks();
  activeCount += 1;
}

/** Call when player closes */
export function deactivateAdInjectionGuard() {
  activeCount = Math.max(0, activeCount - 1);
}

/** Lightweight always-on init (safe in production) */
export function initAdInjectionGuard() {
  installHooks();
}
