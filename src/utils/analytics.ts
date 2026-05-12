// Lightweight analytics helper.
// Dispatches a CustomEvent on window and forwards to gtag / dataLayer / plausible
// if any of them are present. Safe to call from anywhere.

export type AnalyticsEvent =
  | 'share_native_success'
  | 'share_native_cancelled'
  | 'share_clipboard_success'
  | 'share_clipboard_failed'
  | 'share_unsupported';

export interface ShareEventProps {
  contentType: 'movie' | 'tv';
  contentId: number | string;
  title?: string;
  url?: string;
  method?: 'native' | 'clipboard';
  error?: string;
}

export function trackEvent(event: AnalyticsEvent, props: ShareEventProps) {
  const payload = { event, ...props, timestamp: Date.now() };

  try {
    // Console (always on, useful for debugging + simple log-based analytics)
    if (typeof console !== 'undefined') {
      console.info('[analytics]', event, props);
    }

    if (typeof window === 'undefined') return;

    // Google Analytics (gtag.js)
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', event, props);
    }

    // GTM / dataLayer
    const dataLayer = (window as any).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push(payload);
    }

    // Plausible
    const plausible = (window as any).plausible;
    if (typeof plausible === 'function') {
      plausible(event, { props });
    }

    // Custom event so any listener (incl. future analytics) can hook in
    window.dispatchEvent(new CustomEvent('app:analytics', { detail: payload }));
  } catch {
    // never let analytics break the app
  }
}
