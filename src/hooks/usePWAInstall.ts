import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isSupported: boolean;
  install: () => Promise<boolean>;
}

// Global state to share across components - capture early
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let listeners: Set<() => void> = new Set();

// Capture the event immediately at module load (before React)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach(listener => listener());
    console.log('PWA: beforeinstallprompt captured');
  });
}

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Check if browser supports PWA installation
const isPWASupported = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge|Edg/.test(navigator.userAgent);
  const isEdge = /Edg/.test(navigator.userAgent);
  const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
  const isOpera = /OPR/.test(navigator.userAgent);
  return isChrome || isEdge || isSamsung || isOpera;
};

// Check if already installed
const checkIfInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const usePWAInstall = (): PWAInstallState => {
  const [canInstall, setCanInstall] = useState(!!globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(checkIfInstalled);
  const [isSupported] = useState(isPWASupported);

  useEffect(() => {
    if (isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
      notifyListeners();
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      globalDeferredPrompt = null;
      notifyListeners();
    };

    // Subscribe to global state changes
    const updateState = () => {
      setCanInstall(!!globalDeferredPrompt);
    };
    listeners.add(updateState);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      listeners.delete(updateState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const install = useCallback(async (): Promise<boolean> => {
    // If we have the native prompt, use it
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const { outcome } = await globalDeferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setCanInstall(false);
          globalDeferredPrompt = null;
          notifyListeners();
          return true;
        }
      } catch (error) {
        console.error('PWA install error:', error);
      }
      return false;
    }
    
    // No native prompt available - return false to trigger fallback
    return false;
  }, []);

  return { canInstall, isInstalled, isSupported, install };
};
