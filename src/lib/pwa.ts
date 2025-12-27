// PWA Utility Functions for Setupati School Management System

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// PWA Installation Management
export class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.showInstallButton();
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });

    // Check if already installed
    this.checkIfInstalled();
  }

  private checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone === true) {
      this.isInstalled = true;
      return;
    }

    // Check if installed via Chrome
    if (document.referrer.includes('android-app://')) {
      this.isInstalled = true;
      return;
    }
  }

  public async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install failed', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  private showInstallButton() {
    // Dispatch custom event for UI components to listen
    window.dispatchEvent(
      new CustomEvent('pwa-installable', {
        detail: { installable: true }
      })
    );
  }

  private hideInstallButton() {
    // Dispatch custom event for UI components to listen
    window.dispatchEvent(
      new CustomEvent('pwa-installable', {
        detail: { installable: false }
      })
    );
  }
}

// Network Status Management
export class NetworkManager {
  private isOnline = navigator.onLine;
  private callbacks: {
    online: (() => void)[];
    offline: (() => void)[];
  } = {
    online: [],
    offline: []
  };

  constructor() {
    this.init();
  }

  private init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.callbacks.online.forEach((callback) => callback());
      this.showOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.callbacks.offline.forEach((callback) => callback());
      this.showOfflineStatus();
    });
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public onOnline(callback: () => void) {
    this.callbacks.online.push(callback);
  }

  public onOffline(callback: () => void) {
    this.callbacks.offline.push(callback);
  }

  private showOnlineStatus() {
    // Dispatch custom event for UI components
    window.dispatchEvent(
      new CustomEvent('network-status', {
        detail: { online: true }
      })
    );
  }

  private showOfflineStatus() {
    // Dispatch custom event for UI components
    window.dispatchEvent(
      new CustomEvent('network-status', {
        detail: { online: false }
      })
    );
  }
}

// Service Worker Management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW: Registration successful', this.registration);

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          this.handleUpdate();
        });

        // Check for existing updates
        if (this.registration.waiting) {
          this.handleUpdate();
        }
      } catch (error) {
        console.error('SW: Registration failed', error);
      }
    }
  }

  private handleUpdate() {
    if (!this.registration) return;

    const newWorker = this.registration.installing || this.registration.waiting;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        // New version available
        this.showUpdatePrompt();
      }
    });
  }

  private showUpdatePrompt() {
    // Dispatch custom event for UI components
    window.dispatchEvent(
      new CustomEvent('sw-update-available', {
        detail: { updateAvailable: true }
      })
    );
  }

  public async updateServiceWorker(): Promise<void> {
    if (!this.registration || !this.registration.waiting) return;

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to activate the new service worker
    window.location.reload();
  }
}

// Initialize PWA managers
export const pwaManager = new PWAManager();
export const networkManager = new NetworkManager();
export const serviceWorkerManager = new ServiceWorkerManager();

// Utility functions
export function isPWAInstalled(): boolean {
  return pwaManager.isAppInstalled();
}

export function isPWAInstallable(): boolean {
  return pwaManager.isInstallable();
}

export function installPWA(): Promise<boolean> {
  return pwaManager.installPWA();
}

export function isOnline(): boolean {
  return networkManager.getNetworkStatus();
}

export function onNetworkChange(
  onlineCallback: () => void,
  offlineCallback: () => void
) {
  networkManager.onOnline(onlineCallback);
  networkManager.onOffline(offlineCallback);
}
