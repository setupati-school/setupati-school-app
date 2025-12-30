/**
 * Bundle Preloader - Advanced resource preloading and prefetching for optimized loading
 * Implements intelligent preloading strategies based on user behavior and route patterns
 */

interface PreloadStrategy {
  immediate: string[]; // Resources to preload immediately
  onIdle: string[]; // Resources to preload when browser is idle
  onHover: string[]; // Resources to preload on hover/interaction
  onRoute: Record<string, string[]>; // Route-specific preloading
}

interface BundleManifest {
  [key: string]: {
    file: string;
    imports?: string[];
    css?: string[];
    assets?: string[];
  };
}

class BundlePreloader {
  private preloadedChunks = new Set<string>();
  private prefetchedChunks = new Set<string>();
  private manifest: BundleManifest | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private idleCallback: number | null = null;

  constructor() {
    this.initializePreloader();
  }

  /**
   * Initialize the preloader system
   */
  private async initializePreloader(): Promise<void> {
    // Load the bundle manifest
    await this.loadManifest();

    // Set up intersection observer for hover preloading
    this.setupIntersectionObserver();

    // Preload critical chunks immediately
    this.preloadCriticalChunks();

    // Schedule idle preloading
    this.scheduleIdlePreloading();
  }

  /**
   * Load the Vite bundle manifest
   */
  private async loadManifest(): Promise<void> {
    try {
      // In production, Vite generates a manifest.json file
      const response = await fetch('/assets/manifest.json');
      if (response.ok) {
        this.manifest = await response.json();
      }
    } catch (error) {
      console.warn('Could not load bundle manifest:', error);
    }
  }

  /**
   * Set up intersection observer for smart preloading
   */
  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const preloadHint = element.dataset.preload;
            if (preloadHint) {
              this.preloadChunk(preloadHint);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start preloading 50px before element is visible
        threshold: 0.1
      }
    );
  }

  /**
   * Preload critical chunks that are needed for initial render
   */
  private preloadCriticalChunks(): void {
    const criticalChunks = [
      'react-core',
      'react-dom',
      'react-router',
      'styling'
    ];

    criticalChunks.forEach((chunk) => {
      this.preloadChunk(chunk);
    });
  }

  /**
   * Schedule preloading during browser idle time
   */
  private scheduleIdlePreloading(): void {
    const idleChunks = ['react-query', 'forms', 'icons', 'date-utils'];

    if ('requestIdleCallback' in window) {
      this.idleCallback = requestIdleCallback(
        () => {
          idleChunks.forEach((chunk) => {
            this.prefetchChunk(chunk);
          });
        },
        { timeout: 5000 }
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        idleChunks.forEach((chunk) => {
          this.prefetchChunk(chunk);
        });
      }, 2000);
    }
  }

  /**
   * Preload a specific chunk with high priority
   */
  preloadChunk(chunkName: string): void {
    if (this.preloadedChunks.has(chunkName)) return;

    const chunkUrl = this.getChunkUrl(chunkName);
    if (!chunkUrl) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = chunkUrl;
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
    this.preloadedChunks.add(chunkName);

    // Also preload associated CSS if available
    const cssUrl = this.getChunkCssUrl(chunkName);
    if (cssUrl) {
      this.preloadCSS(cssUrl);
    }
  }

  /**
   * Prefetch a chunk with lower priority
   */
  prefetchChunk(chunkName: string): void {
    if (
      this.prefetchedChunks.has(chunkName) ||
      this.preloadedChunks.has(chunkName)
    ) {
      return;
    }

    const chunkUrl = this.getChunkUrl(chunkName);
    if (!chunkUrl) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = chunkUrl;
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
    this.prefetchedChunks.add(chunkName);
  }

  /**
   * Preload CSS with high priority
   */
  private preloadCSS(cssUrl: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = cssUrl;
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
  }

  /**
   * Get the URL for a chunk based on the manifest
   */
  private getChunkUrl(chunkName: string): string | null {
    if (!this.manifest) {
      // Fallback URL pattern when manifest is not available
      return `/assets/js/${chunkName}-[hash].js`;
    }

    // Look for the chunk in the manifest
    const entry = this.manifest[chunkName];
    if (entry && entry.file) {
      return `/${entry.file}`;
    }

    // Try to find by pattern matching
    for (const [key, value] of Object.entries(this.manifest)) {
      if (key.includes(chunkName) && value.file) {
        return `/${value.file}`;
      }
    }

    return null;
  }

  /**
   * Get the CSS URL for a chunk
   */
  private getChunkCssUrl(chunkName: string): string | null {
    if (!this.manifest) return null;

    const entry = this.manifest[chunkName];
    if (entry && entry.css && entry.css.length > 0) {
      return `/${entry.css[0]}`;
    }

    return null;
  }

  /**
   * Preload route-specific chunks based on current route
   */
  preloadForRoute(route: string): void {
    const routeChunkMap: Record<string, string[]> = {
      '/': ['react-query', 'forms'],
      '/dashboard': ['charts', 'date-utils', 'react-query'],
      '/students': ['forms', 'react-query', 'charts'],
      '/teachers': ['forms', 'react-query'],
      '/attendance': ['date-utils', 'forms', 'react-query'],
      '/results': ['charts', 'react-query'],
      '/circulars': ['forms', 'react-query'],
      '/timetable': ['date-utils', 'react-query'],
      '/subjects': ['forms', 'react-query']
    };

    const chunksToPreload = routeChunkMap[route] || [];
    chunksToPreload.forEach((chunk) => {
      this.prefetchChunk(chunk);
    });
  }

  /**
   * Preload chunks on user interaction (hover, focus)
   */
  preloadOnInteraction(element: HTMLElement, chunks: string[]): void {
    if (!this.intersectionObserver) return;

    // Add data attribute for intersection observer
    element.dataset.preload = chunks.join(',');
    this.intersectionObserver.observe(element);

    // Also add hover listeners for immediate preloading
    const handleInteraction = () => {
      chunks.forEach((chunk) => this.preloadChunk(chunk));
      element.removeEventListener('mouseenter', handleInteraction);
      element.removeEventListener('focus', handleInteraction);
    };

    element.addEventListener('mouseenter', handleInteraction, { once: true });
    element.addEventListener('focus', handleInteraction, { once: true });
  }

  /**
   * Preload chunks for likely next navigation
   */
  preloadLikelyNavigation(): void {
    // Based on analytics or user behavior patterns
    const likelyChunks = [
      'react-query', // Most pages use this
      'forms', // Common across many pages
      'date-utils' // Used in multiple components
    ];

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        likelyChunks.forEach((chunk) => this.prefetchChunk(chunk));
      });
    }
  }

  /**
   * Preload chunks based on user role
   */
  preloadForUserRole(role: 'admin' | 'teacher' | 'student' | 'parent'): void {
    const roleChunkMap: Record<string, string[]> = {
      admin: ['charts', 'forms', 'react-query', 'firebase-firestore'],
      teacher: ['forms', 'react-query', 'date-utils', 'charts'],
      student: ['react-query', 'date-utils'],
      parent: ['react-query', 'date-utils']
    };

    const chunksToPreload = roleChunkMap[role] || [];
    chunksToPreload.forEach((chunk) => {
      this.prefetchChunk(chunk);
    });
  }

  /**
   * Get preloading statistics
   */
  getStats(): {
    preloadedChunks: number;
    prefetchedChunks: number;
    totalChunks: number;
  } {
    return {
      preloadedChunks: this.preloadedChunks.size,
      prefetchedChunks: this.prefetchedChunks.size,
      totalChunks: this.manifest ? Object.keys(this.manifest).length : 0
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    if (this.idleCallback) {
      cancelIdleCallback(this.idleCallback);
      this.idleCallback = null;
    }

    this.preloadedChunks.clear();
    this.prefetchedChunks.clear();
  }
}

// Create singleton instance
export const bundlePreloader = new BundlePreloader();

// Export class for testing
export default BundlePreloader;

// Utility function to preload chunks for a specific component
export function preloadComponentChunks(componentName: string): void {
  const componentChunkMap: Record<string, string[]> = {
    CircularsPage: ['forms', 'react-query'],
    StudentsPage: ['forms', 'react-query', 'charts'],
    TeachersPage: ['forms', 'react-query'],
    AttendancePage: ['date-utils', 'forms', 'react-query'],
    TimetablePage: ['date-utils', 'react-query'],
    ExamResultsPage: ['charts', 'react-query'],
    SubjectsPage: ['forms', 'react-query']
  };

  const chunks = componentChunkMap[componentName] || [];
  chunks.forEach((chunk) => {
    bundlePreloader.prefetchChunk(chunk);
  });
}

// Utility function to add preloading to navigation links
export function enhanceNavigationWithPreloading(): void {
  // Find all navigation links and add preloading
  const navLinks = document.querySelectorAll('a[href^="/"]');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const chunks = getChunksForRoute(href);
    if (chunks.length > 0) {
      bundlePreloader.preloadOnInteraction(link as HTMLElement, chunks);
    }
  });
}

// Helper function to map routes to chunks
function getChunksForRoute(route: string): string[] {
  const routeChunkMap: Record<string, string[]> = {
    '/dashboard': ['charts', 'react-query'],
    '/students': ['forms', 'react-query', 'charts'],
    '/teachers': ['forms', 'react-query'],
    '/attendance': ['date-utils', 'forms', 'react-query'],
    '/results': ['charts', 'react-query'],
    '/circulars': ['forms', 'react-query'],
    '/timetable': ['date-utils', 'react-query'],
    '/subjects': ['forms', 'react-query']
  };

  return routeChunkMap[route] || [];
}
