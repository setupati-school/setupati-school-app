// PWA Foundation Test Utilities
// These functions help verify that PWA foundation setup is working correctly

export interface PWATestResults {
  manifestValid: boolean;
  serviceWorkerRegistered: boolean;
  httpsEnabled: boolean;
  viewportConfigured: boolean;
  iconsPresent: boolean;
  themeColorSet: boolean;
  installable: boolean;
  offlineCapable: boolean;
}

export async function testPWAFoundation(): Promise<PWATestResults> {
  const results: PWATestResults = {
    manifestValid: false,
    serviceWorkerRegistered: false,
    httpsEnabled: false,
    viewportConfigured: false,
    iconsPresent: false,
    themeColorSet: false,
    installable: false,
    offlineCapable: false
  };

  try {
    // Test 1: Check if manifest is valid
    results.manifestValid = await testManifest();

    // Test 2: Check if service worker is registered
    results.serviceWorkerRegistered = await testServiceWorker();

    // Test 3: Check HTTPS (in production)
    results.httpsEnabled = testHTTPS();

    // Test 4: Check viewport configuration
    results.viewportConfigured = testViewport();

    // Test 5: Check icons presence
    results.iconsPresent = await testIcons();

    // Test 6: Check theme color
    results.themeColorSet = testThemeColor();

    // Test 7: Check installability
    results.installable = await testInstallability();

    // Test 8: Check offline capability
    results.offlineCapable = await testOfflineCapability();
  } catch (error) {
    console.error('PWA Foundation Test Error:', error);
  }

  return results;
}

async function testManifest(): Promise<boolean> {
  try {
    const response = await fetch('/manifest.json');
    if (!response.ok) return false;

    const manifest = await response.json();

    // Check required fields
    const requiredFields = [
      'name',
      'short_name',
      'start_url',
      'display',
      'theme_color',
      'background_color',
      'icons'
    ];
    return requiredFields.every((field) => manifest[field] !== undefined);
  } catch {
    return false;
  }
}

async function testServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration !== undefined;
  } catch {
    return false;
  }
}

function testHTTPS(): boolean {
  return location.protocol === 'https:' || location.hostname === 'localhost';
}

function testViewport(): boolean {
  const viewport = document.querySelector('meta[name="viewport"]');
  return (
    viewport !== null &&
    viewport.getAttribute('content')?.includes('width=device-width') === true
  );
}

async function testIcons(): Promise<boolean> {
  try {
    const response = await fetch('/school.png');
    return response.ok;
  } catch {
    return false;
  }
}

function testThemeColor(): boolean {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  return (
    themeColor !== null && themeColor.getAttribute('content') === '#1e40af'
  );
}

async function testInstallability(): Promise<boolean> {
  // This is a basic check - actual installability depends on many factors
  return (
    'serviceWorker' in navigator &&
    window.matchMedia('(display-mode: browser)').matches &&
    !window.matchMedia('(display-mode: standalone)').matches
  );
}

async function testOfflineCapability(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) return false;

    // Test if service worker can handle fetch events by checking for any cached content
    const cacheNames = await caches.keys();

    // Look for any of our expected cache names
    const expectedCachePatterns = [
      'setupati-school-static',
      'setupati-school-dynamic',
      'workbox-precache',
      'google-fonts'
    ];

    const hasRelevantCache = cacheNames.some((cacheName) =>
      expectedCachePatterns.some((pattern) => cacheName.includes(pattern))
    );

    if (!hasRelevantCache) return false;

    // Try to find any cached content
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        if (keys.length > 0) {
          return true; // Found cached content
        }
      } catch (error) {
        continue; // Try next cache
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function logPWATestResults(results: PWATestResults): void {
  console.group('PWA Foundation Test Results');

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    console.log(`${status} ${testName}: ${passed ? 'PASS' : 'FAIL'}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const score = Math.round((passedTests / totalTests) * 100);

  console.log(
    `\n📊 Overall Score: ${score}% (${passedTests}/${totalTests} tests passed)`
  );

  if (score === 100) {
    console.log('🎉 PWA Foundation setup is complete!');
  } else if (score >= 75) {
    console.log(
      '⚠️ PWA Foundation is mostly ready, but some improvements needed'
    );
  } else {
    console.log('🔧 PWA Foundation needs significant work');
  }

  console.groupEnd();
}

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(async () => {
    const results = await testPWAFoundation();
    logPWATestResults(results);
  }, 2000); // Wait 2 seconds for everything to load
}
