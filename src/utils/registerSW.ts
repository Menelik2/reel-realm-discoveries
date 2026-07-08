// Guarded service worker registration — never registers in Lovable preview/dev.
export const registerServiceWorker = () => {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  const isProd = import.meta.env.PROD;
  const inIframe = window.self !== window.top;
  const host = window.location.hostname;
  const url = new URL(window.location.href);

  const isPreviewHost =
    host.startsWith('id-preview--') ||
    host.startsWith('preview--') ||
    host === 'lovableproject.com' ||
    host.endsWith('.lovableproject.com') ||
    host === 'lovableproject-dev.com' ||
    host.endsWith('.lovableproject-dev.com') ||
    host === 'beta.lovable.dev' ||
    host.endsWith('.beta.lovable.dev');

  const killSwitch = url.searchParams.get('sw') === 'off';

  if (!isProd || inIframe || isPreviewHost || killSwitch) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => {
        if (r.active?.scriptURL.endsWith('/sw.js')) r.unregister();
      });
    }).catch(() => {});
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
};
