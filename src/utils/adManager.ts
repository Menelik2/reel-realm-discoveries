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
    // More aggressive cleanup - remove ALL processed ad elements
    const adsElements = document.querySelectorAll('ins.adsbygoogle[data-adsbygoogle-status]');
    adsElements.forEach((element) => {
      try {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (e) {
        console.warn('Failed to remove ad element:', e);
      }
    });
    
    // Also cleanup any orphaned elements
    const orphanedAds = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
    orphanedAds.forEach((element) => {
      const slot = element.getAttribute('data-ad-slot');
      if (slot && this.initializedSlots.has(slot)) {
        try {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (e) {
          console.warn('Failed to remove orphaned ad element:', e);
        }
      }
    });
  }

  // Clean up specific slot - more aggressive
  cleanupSlot(slot: string): void {
    console.log(`AdManager: Cleaning up slot ${slot}`);
    
    // Find and remove all ad elements for this specific slot
    const adsElements = document.querySelectorAll(`ins.adsbygoogle[data-ad-slot="${slot}"]`);
    adsElements.forEach((element, index) => {
      try {
        console.log(`Removing ad element ${index + 1} for slot ${slot}`);
        // Remove the element completely
        element.remove();
      } catch (e) {
        console.warn(`Failed to remove ad element for slot ${slot}:`, e);
      }
    });
    
    // Also check for any processed ads in the same container
    const processedAds = document.querySelectorAll(`ins.adsbygoogle[data-adsbygoogle-status][data-ad-slot="${slot}"]`);
    processedAds.forEach((element, index) => {
      try {
        console.log(`Removing processed ad element ${index + 1} for slot ${slot}`);
        element.remove();
      } catch (e) {
        console.warn(`Failed to remove processed ad element for slot ${slot}:`, e);
      }
    });
    
    this.resetSlot(slot);
    console.log(`AdManager: Cleanup complete for slot ${slot}`);
  }

  // Force cleanup all ads and reset state
  forceReset(): void {
    console.log('AdManager: Force reset - cleaning up all ads');
    
    // Remove all ad elements more aggressively
    const allAdsElements = document.querySelectorAll('ins.adsbygoogle');
    allAdsElements.forEach((element) => {
      try {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (e) {
        console.warn('Failed to remove ad element:', e);
      }
    });
    
    // Clear all tracked slots
    this.clearAllSlots();
    
    // Reset adsbygoogle array if needed
    if (window.adsbygoogle) {
      window.adsbygoogle.length = 0;
    }
    
    console.log('AdManager: Force reset complete');
  }

  getInitializedSlots(): string[] {
    return Array.from(this.initializedSlots);
  }
}

export const adManager = AdManager.getInstance();