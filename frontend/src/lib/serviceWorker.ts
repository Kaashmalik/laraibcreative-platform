/**
 * Service Worker Registration & Utilities
 * Handles PWA functionality including offline support
 */

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null;
  
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return null;
  }
  
  // Only register in production or if explicitly enabled
  const enablePWA = process.env.NEXT_PUBLIC_ENABLE_PWA === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction && !enablePWA) {
    console.log('[SW] Service worker disabled in development');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    console.log('[SW] Service worker registered:', registration.scope);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[SW] New version available');
            dispatchUpdateEvent();
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    
    if (success) {
      console.log('[SW] Service worker unregistered');
    }
    
    return success;
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
    return false;
  }
}

/**
 * Check if there's a service worker update available
 */
export async function checkForUpdates(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return !!registration.waiting;
  } catch (error) {
    console.error('[SW] Update check failed:', error);
    return false;
  }
}

/**
 * Apply pending service worker update
 */
export async function applyUpdate(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page after the new service worker takes over
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  } catch (error) {
    console.error('[SW] Apply update failed:', error);
  }
}

/**
 * Dispatch custom event for service worker updates
 */
function dispatchUpdateEvent(): void {
  if (typeof window === 'undefined') return;
  
  window.dispatchEvent(new CustomEvent('sw-update-available'));
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  if (!('caches' in window)) return;
  
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((name) => caches.delete(name))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Clear caches failed:', error);
  }
}

/**
 * Request background sync
 */
export async function requestSync(tag: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if sync is supported
    if (!('sync' in registration)) {
      console.log('[SW] Background sync not supported');
      return false;
    }
    
    await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
    console.log(`[SW] Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error('[SW] Sync registration failed:', error);
    return false;
  }
}

/**
 * Check if app is running as PWA
 */
export function isRunningAsPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if app is installable
 */
export function isInstallable(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for beforeinstallprompt support
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Get cached data size
 */
export async function getCacheSize(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  if (!('caches' in window) || !('storage' in navigator) || !('estimate' in navigator.storage)) {
    return 0;
  }
  
  try {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  } catch (error) {
    console.error('[SW] Get cache size failed:', error);
    return 0;
  }
}

/**
 * Format bytes to human readable size
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Hook for service worker update notifications
 */
export function useServiceWorkerUpdate(onUpdate: () => void): void {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('sw-update-available', onUpdate);
}

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdates,
  applyUpdate,
  clearAllCaches,
  requestSync,
  isRunningAsPWA,
  isInstallable,
  getCacheSize,
  formatCacheSize,
};
