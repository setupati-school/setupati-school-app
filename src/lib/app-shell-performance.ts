/**
 * App Shell Performance Utilities
 * Optimizations for shell loading performance
 */

/**
 * Preload critical resources for the app shell
 */
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap';
  fontLink.as = 'style';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const logoImg = new Image();
  logoImg.src = '/school.png';

  // Preload manifest
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'preload';
  manifestLink.href = '/manifest.json';
  manifestLink.as = 'fetch';
  manifestLink.crossOrigin = 'anonymous';
  document.head.appendChild(manifestLink);
};

/**
 * Optimize shell rendering with requestIdleCallback
 */
export const optimizeShellRendering = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 1000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 0);
  }
};

/**
 * Measure and report shell loading performance
 */
export const measureShellPerformance = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    // Measure First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log(`App Shell FCP: ${entry.startTime}ms`);
        }
        if (entry.name === 'largest-contentful-paint') {
          console.log(`App Shell LCP: ${entry.startTime}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

    // Measure shell-specific timing
    performance.mark('shell-start');

    // Mark when shell is ready
    requestAnimationFrame(() => {
      performance.mark('shell-ready');
      performance.measure('shell-load-time', 'shell-start', 'shell-ready');

      const shellLoadTime = performance.getEntriesByName('shell-load-time')[0];
      if (shellLoadTime) {
        console.log(`App Shell Load Time: ${shellLoadTime.duration}ms`);
      }
    });
  }
};

/**
 * Initialize app shell performance optimizations
 */
export const initializeShellPerformance = () => {
  // Start performance measurement
  measureShellPerformance();

  // Preload critical resources
  optimizeShellRendering(() => {
    preloadCriticalResources();
  });

  // Set up resource hints
  const dns = document.createElement('link');
  dns.rel = 'dns-prefetch';
  dns.href = '//fonts.googleapis.com';
  document.head.appendChild(dns);

  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.gstatic.com';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);
};

/**
 * Check if app shell is cached and ready
 */
export const isShellCached = async (): Promise<boolean> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('app-shell-v1');
      const cachedShell = await cache.match('/');
      return !!cachedShell;
    } catch (error) {
      console.warn('Failed to check shell cache:', error);
      return false;
    }
  }
  return false;
};

/**
 * Cache app shell resources
 */
export const cacheShellResources = async () => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('app-shell-v1');
      const shellResources = [
        '/',
        '/manifest.json',
        '/school.png'
        // Add other critical shell resources
      ];

      await cache.addAll(shellResources);
      console.log('App shell resources cached successfully');
    } catch (error) {
      console.warn('Failed to cache shell resources:', error);
    }
  }
};
