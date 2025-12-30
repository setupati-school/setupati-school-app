/**
 * Performance Budget Monitor
 * Tracks and enforces performance budgets for bundle sizes and loading times
 */

interface PerformanceBudget {
  // Bundle size budgets (in KB)
  maxBundleSize: number;
  maxChunkSize: number;
  maxCSSSize: number;
  maxImageSize: number;

  // Timing budgets (in milliseconds)
  maxFCP: number; // First Contentful Paint
  maxLCP: number; // Largest Contentful Paint
  maxFID: number; // First Input Delay
  maxCLS: number; // Cumulative Layout Shift
  maxTTI: number; // Time to Interactive
}

interface PerformanceMetrics {
  bundleSize?: number;
  chunkSizes?: Record<string, number>;
  cssSize?: number;
  imageSize?: number;
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  tti?: number;
  timestamp: number;
}

interface BudgetViolation {
  metric: string;
  actual: number;
  budget: number;
  severity: 'warning' | 'error';
  message: string;
}

class PerformanceBudgetMonitor {
  private budget: PerformanceBudget = {
    // Bundle size budgets (KB)
    maxBundleSize: 150, // Total initial bundle size
    maxChunkSize: 300, // Individual chunk size
    maxCSSSize: 50, // CSS bundle size
    maxImageSize: 100, // Individual image size

    // Timing budgets (ms)
    maxFCP: 1800, // First Contentful Paint
    maxLCP: 2500, // Largest Contentful Paint
    maxFID: 100, // First Input Delay
    maxCLS: 0.1, // Cumulative Layout Shift
    maxTTI: 3800 // Time to Interactive
  };

  private violations: BudgetViolation[] = [];
  private observers: PerformanceObserver[] = [];

  constructor(customBudget?: Partial<PerformanceBudget>) {
    if (customBudget) {
      this.budget = { ...this.budget, ...customBudget };
    }

    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    this.monitorCoreWebVitals();
    this.monitorResourceSizes();
    this.monitorNavigationTiming();
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorCoreWebVitals(): void {
    // Monitor LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;

          if (lastEntry) {
            this.checkBudget('lcp', lastEntry.startTime, this.budget.maxLCP);
          }
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }

      // Monitor FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.checkBudget(
              'fid',
              entry.processingStart - entry.startTime,
              this.budget.maxFID
            );
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID monitoring not supported');
      }

      // Monitor CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          this.checkBudget('cls', clsValue, this.budget.maxCLS);
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS monitoring not supported');
      }
    }

    // Monitor FCP using Navigation Timing API
    this.monitorFCP();
  }

  /**
   * Monitor First Contentful Paint
   */
  private monitorFCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.checkBudget('fcp', entry.startTime, this.budget.maxFCP);
            }
          });
        });

        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP monitoring not supported');
      }
    }
  }

  /**
   * Monitor resource sizes
   */
  private monitorResourceSizes(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.transferSize) {
              const sizeKB = entry.transferSize / 1024;

              // Check different resource types
              if (entry.name.includes('.js')) {
                this.checkBudget('chunk', sizeKB, this.budget.maxChunkSize);
              } else if (entry.name.includes('.css')) {
                this.checkBudget('css', sizeKB, this.budget.maxCSSSize);
              } else if (
                entry.name.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/i)
              ) {
                this.checkBudget('image', sizeKB, this.budget.maxImageSize);
              }
            }
          });
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource monitoring not supported');
      }
    }
  }

  /**
   * Monitor navigation timing
   */
  private monitorNavigationTiming(): void {
    window.addEventListener('load', () => {
      // Use requestIdleCallback to avoid blocking main thread
      const measureTTI = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          const tti = navigation.loadEventEnd - navigation.fetchStart;
          this.checkBudget('tti', tti, this.budget.maxTTI);
        }
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(measureTTI);
      } else {
        setTimeout(measureTTI, 0);
      }
    });
  }

  /**
   * Check if a metric violates the budget
   */
  private checkBudget(metric: string, actual: number, budget: number): void {
    if (actual > budget) {
      const violation: BudgetViolation = {
        metric,
        actual,
        budget,
        severity: actual > budget * 1.5 ? 'error' : 'warning',
        message: `${metric.toUpperCase()} budget exceeded: ${actual.toFixed(2)} > ${budget}`
      };

      this.violations.push(violation);
      this.reportViolation(violation);
    }
  }

  /**
   * Report budget violation
   */
  private reportViolation(violation: BudgetViolation): void {
    const logMethod =
      violation.severity === 'error' ? console.error : console.warn;
    logMethod(`Performance Budget Violation: ${violation.message}`);

    // In production, you might want to send this to an analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(violation);
    }
  }

  /**
   * Send violation data to analytics service
   */
  private sendToAnalytics(violation: BudgetViolation): void {
    // Placeholder for analytics integration
    // You could integrate with Google Analytics, DataDog, New Relic, etc.

    if ('gtag' in window) {
      (window as any).gtag('event', 'performance_budget_violation', {
        metric: violation.metric,
        actual_value: violation.actual,
        budget_value: violation.budget,
        severity: violation.severity
      });
    }

    // Example: Send to custom analytics endpoint
    if ('fetch' in window) {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'budget_violation',
          ...violation,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silently fail - don't let analytics errors affect the app
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now()
    };

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      metrics.fcp = navigation.responseEnd - navigation.fetchStart;
      metrics.tti = navigation.loadEventEnd - navigation.fetchStart;
    }

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry: any) => {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = entry.startTime;
      }
    });

    return metrics;
  }

  /**
   * Get all budget violations
   */
  getViolations(): BudgetViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violations history
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Update budget configuration
   */
  updateBudget(newBudget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...newBudget };
  }

  /**
   * Get current budget configuration
   */
  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
    this.violations = [];
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    budget: PerformanceBudget;
    metrics: PerformanceMetrics;
    violations: BudgetViolation[];
    summary: {
      totalViolations: number;
      errorViolations: number;
      warningViolations: number;
      overallStatus: 'good' | 'warning' | 'error';
    };
  } {
    const metrics = this.getMetrics();
    const violations = this.getViolations();

    const errorViolations = violations.filter(
      (v) => v.severity === 'error'
    ).length;
    const warningViolations = violations.filter(
      (v) => v.severity === 'warning'
    ).length;

    let overallStatus: 'good' | 'warning' | 'error' = 'good';
    if (errorViolations > 0) {
      overallStatus = 'error';
    } else if (warningViolations > 0) {
      overallStatus = 'warning';
    }

    return {
      budget: this.getBudget(),
      metrics,
      violations,
      summary: {
        totalViolations: violations.length,
        errorViolations,
        warningViolations,
        overallStatus
      }
    };
  }
}

// Create singleton instance
export const performanceBudget = new PerformanceBudgetMonitor();

// Export for testing and custom configurations
export default PerformanceBudgetMonitor;
