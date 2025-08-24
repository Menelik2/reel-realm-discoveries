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
    adsElements.forEach((element, index) => {
      // Only remove if there are duplicates or the element is not visible
      if (index > 0 || !(element as HTMLElement).offsetParent) {
        element.remove();
      }
    });
  }

  getInitializedSlots(): string[] {
    return Array.from(this.initializedSlots);
  }
}

export const adManager = AdManager.getInstance();