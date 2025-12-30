/**
 * Resource Hints Utility for Performance Optimization
 * Implements preloading and prefetching strategies for better performance
 * Integrates with bundle preloader for comprehensive resource optimization
 */

import { bundlePreloader } from './bundle-preloader';

interface ResourceHint {
  href: string;
  as?: string;
  type?: string;
  crossorigin?: string;
  media?: string;
}

class ResourceHintsManager {
  private preloadedResources = new Set<string>();
  private prefetchedResources = new Set<string>();
  private criticalResourcesLoaded = false;

  /**
   * Preload critical resources that are needed immediately
   */
  preload(resource: ResourceHint): void {
    if (this.preloadedResources.has(resource.href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;

    if (resource.as) link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    if (resource.media) link.media = resource.media;

    // Add error handling
    link.onerror = () => {
      console.warn(`Failed to preload resource: ${resource.href}`);
    };

    document.head.appendChild(link);
    this.preloadedResources.add(resource.href);
  }

  /**
   * Prefetch resources that might be needed later
   */
  prefetch(resource: ResourceHint): void {
    if (this.prefetchedResources.has(resource.href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource.href;

    if (resource.as) link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;

    // Add error handling
    link.onerror = () => {
      console.warn(`Failed to prefetch resource: ${resource.href}`);
    };

    document.head.appendChild(link);
    this.prefetchedResources.add(resource.href);
  }

  /**
   * Preconnect to external domains for faster connection establishment
   */
  preconnect(origin: string, crossorigin = false): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;

    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
  }

  /**
   * DNS prefetch for external domains
   */
  dnsPrefetch(origin: string): void {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = origin;
    document.head.appendChild(link);
  }

  /**
   * Preload critical fonts with optimized loading
   */
  preloadFont(fontUrl: string, type = 'font/woff2'): void {
    this.preload({
      href: fontUrl,
      as: 'font',
      type,
      crossorigin: 'anonymous'
    });
  }

  /**
   * Preload critical CSS
   */
  preloadCSS(cssUrl: string): void {
    this.preload({
      href: cssUrl,
      as: 'style'
    });
  }

  /**
   * Preload critical JavaScript modules
   */
  preloadScript(scriptUrl: string, type = 'text/javascript'): void {
    this.preload({
      href: scriptUrl,
      as: 'script',
      type
    });
  }

  /**
   * Prefetch route chunks for faster navigation
   */
  prefetchRoute(routeChunk: string): void {
    this.prefetch({
      href: routeChunk,
      as: 'script'
    });
  }

  /**
   * Initialize critical resource preloading with enhanced strategies
   */
  initializeCriticalResources(): void {
    if (this.criticalResourcesLoaded) return;

    // Preconnect to external services with priority
    this.preconnect('https://fonts.googleapis.com');
    this.preconnect('https://fonts.gstatic.com', true);

    // DNS prefetch for Firebase and other external services
    this.dnsPrefetch('https://firebase.googleapis.com');
    this.dnsPrefetch('https://firestore.googleapis.com');
    this.dnsPrefetch('https://identitytoolkit.googleapis.com');
    this.dnsPrefetch('https://securetoken.googleapis.com');
    this.dnsPrefetch('https://www.googleapis.com');

    // Preload critical fonts with font-display optimization
    const criticalFonts = [
      '/assets/fonts/inter-var.woff2',
      '/assets/fonts/inter-var-italic.woff2'
    ];

    criticalFonts.forEach((font) => {
      if (this.resourceExists(font)) {
        this.preloadFont(font);
      }
    });

    // Preload critical CSS chunks
    this.preloadCriticalCSS();

    // Initialize bundle preloader integration
    this.integrateBundlePreloader();

    this.criticalResourcesLoaded = true;
  }

  /**
   * Preload critical CSS chunks
   */
  private preloadCriticalCSS(): void {
    const criticalCSS = [
      '/assets/css/index-[hash].css',
      '/assets/css/app-shell-[hash].css'
    ];

    criticalCSS.forEach((css) => {
      if (this.resourceExists(css)) {
        this.preloadCSS(css);
      }
    });
  }

  /**
   * Integrate with bundle preloader for comprehensive optimization
   */
  private integrateBundlePreloader(): void {
    // Preload critical chunks through bundle preloader
    const criticalChunks = ['react-core', 'react-dom', 'styling'];
    criticalChunks.forEach((chunk) => {
      bundlePreloader.preloadChunk(chunk);
    });
  }

  /**
   * Enhanced prefetching based on user interaction patterns and analytics
   */
  prefetchBasedOnRoute(currentRoute: string): void {
    const routePrefetchMap: Record<string, string[]> = {
      '/': ['/dashboard', '/attendance', '/timetable'],
      '/dashboard': ['/attendance', '/results', '/circulars'],
      '/attendance': ['/dashboard', '/timetable', '/students'],
      '/students': ['/attendance', '/results', '/dashboard'],
      '/teachers': ['/timetable', '/attendance', '/dashboard'],
      '/results': ['/dashboard', '/students'],
      '/circulars': ['/dashboard'],
      '/timetable': ['/attendance', '/dashboard'],
      '/subjects': ['/dashboard', '/timetable']
    };

    const routesToPrefetch = routePrefetchMap[currentRoute] || [];

    // Use requestIdleCallback for non-critical prefetching
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          routesToPrefetch.forEach((route) => {
            this.prefetchRouteChunk(route);
            // Also prefetch through bundle preloader
            bundlePreloader.preloadForRoute(route);
          });
        },
        { timeout: 3000 }
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        routesToPrefetch.forEach((route) => {
          this.prefetchRouteChunk(route);
          bundlePreloader.preloadForRoute(route);
        });
      }, 1500);
    }
  }

  /**
   * Prefetch route chunk with enhanced mapping
   */
  private prefetchRouteChunk(route: string): void {
    const routeChunkMap: Record<string, string[]> = {
      '/dashboard': [
        '/assets/js/dashboard-[hash].js',
        '/assets/js/charts-[hash].js'
      ],
      '/attendance': [
        '/assets/js/attendance-[hash].js',
        '/assets/js/date-utils-[hash].js'
      ],
      '/results': [
        '/assets/js/results-[hash].js',
        '/assets/js/charts-[hash].js'
      ],
      '/circulars': [
        '/assets/js/circulars-[hash].js',
        '/assets/js/forms-[hash].js'
      ],
      '/timetable': [
        '/assets/js/timetable-[hash].js',
        '/assets/js/date-utils-[hash].js'
      ],
      '/students': [
        '/assets/js/students-[hash].js',
        '/assets/js/forms-[hash].js'
      ],
      '/teachers': [
        '/assets/js/teachers-[hash].js',
        '/assets/js/forms-[hash].js'
      ],
      '/subjects': [
        '/assets/js/subjects-[hash].js',
        '/assets/js/forms-[hash].js'
      ]
    };

    const chunkUrls = routeChunkMap[route] || [];
    chunkUrls.forEach((chunkUrl) => {
      if (this.resourceExists(chunkUrl)) {
        this.prefetchRoute(chunkUrl);
      }
    });
  }

  /**
   * Enhanced resource existence check
   */
  private resourceExists(url: string): boolean {
    // Skip hash-based URLs in development
    if (url.includes('[hash]') && import.meta.env.DEV) {
      return false;
    }

    // In production, assume resources exist if they follow the pattern
    return !url.includes('[hash]') || import.meta.env.PROD;
  }

  /**
   * Preload images with responsive and format optimization
   */
  preloadImage(imageUrl: string, sizes?: string): void {
    this.preload({
      href: imageUrl,
      as: 'image'
    });

    // Also preload WebP version if available
    const webpUrl = imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    if (webpUrl !== imageUrl) {
      this.preload({
        href: webpUrl,
        as: 'image'
      });
    }
  }

  /**
   * Prefetch images with lazy loading optimization
   */
  prefetchImage(imageUrl: string): void {
    this.prefetch({
      href: imageUrl,
      as: 'image'
    });
  }

  /**
   * Preload resources based on user role and permissions
   */
  preloadForUserRole(role: 'admin' | 'teacher' | 'student' | 'parent'): void {
    const roleResourceMap: Record<string, string[]> = {
      admin: [
        '/assets/js/charts-[hash].js',
        '/assets/js/forms-[hash].js',
        '/assets/js/firebase-firestore-[hash].js'
      ],
      teacher: [
        '/assets/js/forms-[hash].js',
        '/assets/js/date-utils-[hash].js',
        '/assets/js/charts-[hash].js'
      ],
      student: [
        '/assets/js/date-utils-[hash].js',
        '/assets/js/react-query-[hash].js'
      ],
      parent: [
        '/assets/js/date-utils-[hash].js',
        '/assets/js/react-query-[hash].js'
      ]
    };

    const resourcesToPreload = roleResourceMap[role] || [];

    // Use requestIdleCallback for role-based preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        resourcesToPreload.forEach((resource) => {
          if (this.resourceExists(resource)) {
            this.prefetchRoute(resource);
          }
        });

        // Also use bundle preloader
        bundlePreloader.preloadForUserRole(role);
      });
    }
  }

  /**
   * Preload resources based on network conditions
   */
  preloadBasedOnConnection(): void {
    if (!('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;

    // Adjust preloading strategy based on connection speed
    if (effectiveType === '4g') {
      // Aggressive preloading on fast connections
      bundlePreloader.preloadLikelyNavigation();
      this.preloadAdditionalResources();
    } else if (effectiveType === '3g') {
      // Moderate preloading on medium connections
      this.preloadEssentialResources();
    } else {
      // Minimal preloading on slow connections
      this.preloadCriticalOnly();
    }
  }

  /**
   * Preload additional resources for fast connections
   */
  private preloadAdditionalResources(): void {
    const additionalResources = [
      '/assets/js/charts-[hash].js',
      '/assets/js/animations-[hash].js',
      '/assets/js/i18n-[hash].js'
    ];

    additionalResources.forEach((resource) => {
      if (this.resourceExists(resource)) {
        this.prefetchRoute(resource);
      }
    });
  }

  /**
   * Preload essential resources for medium connections
   */
  private preloadEssentialResources(): void {
    const essentialResources = [
      '/assets/js/forms-[hash].js',
      '/assets/js/react-query-[hash].js'
    ];

    essentialResources.forEach((resource) => {
      if (this.resourceExists(resource)) {
        this.prefetchRoute(resource);
      }
    });
  }

  /**
   * Preload only critical resources for slow connections
   */
  private preloadCriticalOnly(): void {
    // Only preload absolutely critical resources
    bundlePreloader.preloadChunk('react-core');
    bundlePreloader.preloadChunk('styling');
  }

  /**
   * Get comprehensive resource loading statistics
   */
  getStats(): {
    preloadedResources: number;
    prefetchedResources: number;
    bundleStats: ReturnType<typeof bundlePreloader.getStats>;
  } {
    return {
      preloadedResources: this.preloadedResources.size,
      prefetchedResources: this.prefetchedResources.size,
      bundleStats: bundlePreloader.getStats()
    };
  }

  /**
   * Clean up resource hints to prevent memory leaks
   */
  cleanup(): void {
    this.preloadedResources.clear();
    this.prefetchedResources.clear();
    bundlePreloader.cleanup();
  }
}

// Create singleton instance
export const resourceHints = new ResourceHintsManager();

// Auto-initialize critical resources with enhanced timing
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      resourceHints.initializeCriticalResources();

      // Initialize connection-based preloading
      resourceHints.preloadBasedOnConnection();
    });
  } else {
    resourceHints.initializeCriticalResources();
    resourceHints.preloadBasedOnConnection();
  }
}

export default ResourceHintsManager;
