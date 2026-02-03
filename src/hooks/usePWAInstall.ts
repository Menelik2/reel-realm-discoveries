import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
}

// Global state to share across components
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const usePWAInstall = (): PWAInstallState => {
  const [canInstall, setCanInstall] = useState(!!globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

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
  }, []);

  const install = useCallback(async () => {
    if (globalDeferredPrompt) {
      await globalDeferredPrompt.prompt();
      const { outcome } = await globalDeferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
        globalDeferredPrompt = null;
        notifyListeners();
      }
    }
  }, []);

  return { canInstall, isInstalled, install };
};
