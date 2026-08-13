/**
 * Ad / redirect protection while Watch Now is open.
 * Blocks popups, new tabs, and injected ad nodes on the HOST page.
 * Cross-origin iframe interiors cannot be fully controlled.
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
];

const SUSPICIOUS_ATTR = /ads?|banner|popup|popunder|sponsor|tracker|clickunder/i;

let activeCount = 0;
let installed = false;
let observer: MutationObserver | null = null;

let originalOpen: typeof window.open | null = null;
let originalCreateElement: typeof document.createElement | null = null;
let originalAssign: typeof location.assign | null = null;
let originalReplace: typeof location.replace | null = null;

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

function isSameOriginNav(url: string): boolean {
  try {
    const next = new URL(url, window.location.href);
    return next.origin === window.location.origin;
  } catch {
    return false;
  }
}

function isInsidePlayer(node: Node): boolean {
  const el = node instanceof Element ? node : node.parentElement;
  if (!el) return false;
  return !!el.closest?.('[data-video-player-root="true"]');
}

function shouldRemoveElement(el: Element): boolean {
  if (isInsidePlayer(el)) return false;
  if (el.id === "root") return false;

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
    if (/vidsrc\.|embeds?\.|player\./i.test(src)) return false;
    if (isAdUrl(src)) return true;
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
    if (el.getAttribute("data-app-ad") === "true") return false;
    return true;
  }

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
  el.querySelectorAll?.("script, iframe, ins.adsbygoogle").forEach((child) => {
    if (shouldRemoveElement(child)) child.remove();
  });
}

function blockNewTabEvent(e: Event) {
  if (activeCount <= 0) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();
}

function installHooks() {
  if (installed) return;
  installed = true;

  // Hard-block all new windows/tabs while player is open
  originalOpen = window.open.bind(window);
  window.open = function blockedOpen(url?: string | URL, target?: string, features?: string) {
    if (activeCount > 0) {
      console.debug("[adInjectionGuard] blocked window.open", url, target);
      return null;
    }
    return originalOpen!(url as any, target, features);
  } as typeof window.open;

  // Block host-page navigations to external ad URLs while player open
  try {
    originalAssign = window.location.assign.bind(window.location);
    originalReplace = window.location.replace.bind(window.location);

    window.location.assign = function guardedAssign(url: string | URL) {
      const href = String(url);
      if (activeCount > 0 && !isSameOriginNav(href)) {
        console.debug("[adInjectionGuard] blocked location.assign", href);
        return;
      }
      return originalAssign!(url as any);
    };

    window.location.replace = function guardedReplace(url: string | URL) {
      const href = String(url);
      if (activeCount > 0 && !isSameOriginNav(href)) {
        console.debug("[adInjectionGuard] blocked location.replace", href);
        return;
      }
      return originalReplace!(url as any);
    };
  } catch {
    // Some browsers make location methods non-configurable
  }

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
              if (isAdUrl(value)) return;
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
              if (isAdUrl(value)) return;
              desc.set!.call(this, value);
            },
          });
        }
      }

      if (tag === "a") {
        try {
          Object.defineProperty(el, "target", {
            configurable: true,
            enumerable: true,
            get() {
              return (this as any).getAttribute?.("target") ?? "";
            },
            set(value: string) {
              if (activeCount > 0 && (value === "_blank" || value === "_new")) {
                console.debug("[adInjectionGuard] blocked target=_blank");
                return;
              }
              (this as HTMLElement).setAttribute("target", value);
            },
          });
        } catch {
          /* ignore */
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

  // Block _blank / ad link clicks on the host page (capture phase)
  document.addEventListener(
    "click",
    (e) => {
      if (activeCount <= 0) return;
      const t = e.target as HTMLElement | null;
      if (t && isInsidePlayer(t) && !t.closest("a")) return;

      const a = t?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;

      // Allow in-app same-origin links in our UI outside player chrome
      const href = a.getAttribute("href") || a.href || "";
      const target = a.getAttribute("target") || "";

      if (target === "_blank" || target === "_new" || isAdUrl(href)) {
        blockNewTabEvent(e);
        return;
      }

      // Block external navigations triggered while player is open
      if (href && !href.startsWith("#") && !isSameOriginNav(href) && !isInsidePlayer(a)) {
        blockNewTabEvent(e);
      }
    },
    true
  );

  document.addEventListener(
    "auxclick",
    (e) => {
      if (activeCount <= 0) return;
      // Middle-click / open-in-new-tab
      if ((e as MouseEvent).button === 1) {
        blockNewTabEvent(e);
      }
    },
    true
  );

  // Ctrl/Cmd+click often opens new tab
  document.addEventListener(
    "click",
    (e) => {
      if (activeCount <= 0) return;
      const me = e as MouseEvent;
      if (me.ctrlKey || me.metaKey || me.shiftKey) {
        const t = e.target as HTMLElement | null;
        if (t?.closest?.("a")) {
          blockNewTabEvent(e);
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

/** Lightweight always-on init */
export function initAdInjectionGuard() {
  installHooks();
}
