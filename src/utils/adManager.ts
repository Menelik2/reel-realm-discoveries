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

  getInitializedSlots(): string[] {
    return Array.from(this.initializedSlots);
  }
}

export const adManager = AdManager.getInstance();