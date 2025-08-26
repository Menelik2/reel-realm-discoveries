// Global ad manager to prevent duplicate ad initialization
class AdManager {
  private initializedSlots = new Set<string>();
  private static instance: AdManager;

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  isSlotInitialized(slot: string): boolean {
    return this.initializedSlots.has(slot);
  }

  markSlotAsInitialized(slot: string): void {
    this.initializedSlots.add(slot);
  }

  resetSlot(slot: string): void {
    this.initializedSlots.delete(slot);
  }

  clearAllSlots(): void {
    this.initializedSlots.clear();
  }

  cleanup(): void {
    // Remove any stale DOM elements with ads
    const adsElements = document.querySelectorAll('ins.adsbygoogle[data-adsbygoogle-status]');
    adsElements.forEach((element) => {
      // More aggressive cleanup - remove all stale elements
      const parent = element.parentElement;
      if (parent && !parent.isConnected) {
        element.remove();
      }
    });
  }

  // Clean up specific slot
  cleanupSlot(slot: string): void {
    const adsElements = document.querySelectorAll(`ins.adsbygoogle[data-ad-slot="${slot}"]`);
    adsElements.forEach((element) => {
      if (element.getAttribute('data-adsbygoogle-status')) {
        element.remove();
      }
    });
    this.resetSlot(slot);
  }

  // Force cleanup all ads and reset state
  forceReset(): void {
    // Remove all ad elements
    const adsElements = document.querySelectorAll('ins.adsbygoogle[data-adsbygoogle-status]');
    adsElements.forEach((element) => element.remove());
    
    // Clear all tracked slots
    this.clearAllSlots();
    
    // Reset adsbygoogle array if needed
    if (window.adsbygoogle) {
      window.adsbygoogle.length = 0;
    }
  }

  getInitializedSlots(): string[] {
    return Array.from(this.initializedSlots);
  }
}

export const adManager = AdManager.getInstance();