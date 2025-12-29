#!/usr/bin/env node

/**
 * Comprehensive PWA Testing Script
 * Tests all PWA functionality including offline capabilities, service worker, and manifest
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Comprehensive PWA Testing Script');
console.log('=====================================\n');

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, status, message = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${message}`);

  results.tests.push({ name, status, message });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.warnings++;
}

// 1. Check build output files
console.log('📁 Checking Build Output Files');
console.log('-------------------------------');

const distPath = path.join(process.cwd(), 'dist');
const requiredFiles = ['index.html', 'manifest.webmanifest', 'sw.js'];

requiredFiles.forEach((file) => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    logTest(
      `${file} exists`,
      'PASS',
      `Size: ${(stats.size / 1024).toFixed(2)} KB`
    );
  } else {
    logTest(`${file} exists`, 'FAIL', 'File not found');
  }
});

// 2. Validate manifest.webmanifest
console.log('\n📱 Validating Web App Manifest');
console.log('-------------------------------');

const manifestPath = path.join(distPath, 'manifest.webmanifest');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Required fields
    const requiredFields = [
      'name',
      'short_name',
      'start_url',
      'display',
      'icons'
    ];
    requiredFields.forEach((field) => {
      if (manifest[field]) {
        logTest(
          `Manifest has ${field}`,
          'PASS',
          typeof manifest[field] === 'string'
            ? manifest[field]
            : `${Object.keys(manifest[field]).length} items`
        );
      } else {
        logTest(`Manifest has ${field}`, 'FAIL', 'Missing required field');
      }
    });

    // Icon validation
    if (manifest.icons && Array.isArray(manifest.icons)) {
      const hasLargeIcon = manifest.icons.some(
        (icon) =>
          icon.sizes &&
          (icon.sizes.includes('512x512') || icon.sizes.includes('192x192'))
      );
      logTest(
        'Manifest has large icons',
        hasLargeIcon ? 'PASS' : 'FAIL',
        hasLargeIcon
          ? 'Found suitable icons for PWA'
          : 'Need 192x192 or 512x512 icons'
      );

      const hasMaskableIcon = manifest.icons.some(
        (icon) => icon.purpose && icon.purpose.includes('maskable')
      );
      logTest(
        'Manifest has maskable icons',
        hasMaskableIcon ? 'PASS' : 'WARN',
        hasMaskableIcon
          ? 'Maskable icons found'
          : 'Consider adding maskable icons for better Android support'
      );
    }

    // PWA display mode
    const validDisplayModes = ['standalone', 'fullscreen', 'minimal-ui'];
    const hasValidDisplay = validDisplayModes.includes(manifest.display);
    logTest(
      'Valid display mode',
      hasValidDisplay ? 'PASS' : 'FAIL',
      `Display mode: ${manifest.display}`
    );
  } catch (error) {
    logTest('Manifest parsing', 'FAIL', `Invalid JSON: ${error.message}`);
  }
} else {
  logTest('Manifest file exists', 'FAIL', 'manifest.webmanifest not found');
}

// 3. Validate Service Worker
console.log('\n⚙️ Validating Service Worker');
console.log('-----------------------------');

const swPath = path.join(distPath, 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');

  // Check for essential service worker features
  const swFeatures = [
    {
      name: 'Workbox precaching',
      pattern: /precacheAndRoute|__WB_MANIFEST|precache/
    },
    {
      name: 'Cache strategies',
      pattern: /CacheFirst|NetworkFirst|StaleWhileRevalidate|caches\.open/
    },
    { name: 'Background sync', pattern: /addEventListener.*sync|sync.*event/ },
    {
      name: 'Push notifications',
      pattern: /addEventListener.*push|push.*event/
    },
    { name: 'Offline functionality', pattern: /offline|IndexedDB|IDBDatabase/ }
  ];

  swFeatures.forEach((feature) => {
    const hasFeature = feature.pattern.test(swContent);
    logTest(
      `SW has ${feature.name}`,
      hasFeature ? 'PASS' : 'WARN',
      hasFeature ? 'Feature detected' : 'Feature not found'
    );
  });

  // Check service worker size
  const swSize = fs.statSync(swPath).size;
  logTest(
    'Service Worker size',
    swSize < 100000 ? 'PASS' : 'WARN',
    `${(swSize / 1024).toFixed(2)} KB ${swSize > 100000 ? '(Consider optimizing)' : ''}`
  );
} else {
  logTest('Service Worker exists', 'FAIL', 'sw.js not found');
}

// 4. Check index.html for PWA integration
console.log('\n🌐 Validating HTML Integration');
console.log('------------------------------');

const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const htmlContent = fs.readFileSync(indexPath, 'utf8');

  const htmlChecks = [
    { name: 'Manifest link', pattern: /<link[^>]*rel=["']manifest["'][^>]*>/ },
    {
      name: 'Theme color meta',
      pattern: /<meta[^>]*name=["']theme-color["'][^>]*>/
    },
    { name: 'Viewport meta', pattern: /<meta[^>]*name=["']viewport["'][^>]*>/ }
  ];

  htmlChecks.forEach((check) => {
    const hasFeature = check.pattern.test(htmlContent);
    logTest(
      `HTML has ${check.name}`,
      hasFeature ? 'PASS' : 'FAIL',
      hasFeature ? 'Found' : 'Missing'
    );
  });

  // Check for React PWA integration (service worker registration handled by React)
  try {
    const appTsxPath = path.join(process.cwd(), 'src/App.tsx');
    const appContent = fs.readFileSync(appTsxPath, 'utf8');
    const hasReactPWA = /virtual:pwa-register/.test(appContent);
    logTest(
      'React PWA integration',
      hasReactPWA ? 'PASS' : 'FAIL',
      hasReactPWA
        ? 'useRegisterSW hook found in App.tsx'
        : 'Missing React PWA integration'
    );
  } catch (error) {
    logTest('React PWA integration', 'FAIL', 'Could not check App.tsx');
  }
} else {
  logTest('index.html exists', 'FAIL', 'index.html not found');
}

// 5. Check offline functionality files
console.log('\n💾 Validating Offline Functionality');
console.log('-----------------------------------');

const offlineFiles = [
  'src/lib/offline-db.ts',
  'src/lib/sync-manager.ts',
  'src/lib/offline-manager.ts',
  'src/hooks/useOffline.ts',
  'src/components/OfflineIndicator.tsx'
];

offlineFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasIndexedDB = /IndexedDB|openDB|IDBDatabase/.test(content);
    logTest(
      `${path.basename(file)} offline ready`,
      hasIndexedDB ? 'PASS' : 'WARN',
      hasIndexedDB ? 'IndexedDB integration found' : 'No IndexedDB detected'
    );
  } else {
    logTest(`${path.basename(file)} exists`, 'FAIL', 'File not found');
  }
});

// 6. Check Vite PWA plugin configuration
console.log('\n⚡ Validating Vite PWA Configuration');
console.log('------------------------------------');

const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

  const viteChecks = [
    {
      name: 'VitePWA plugin imported',
      pattern: /import.*VitePWA.*from.*vite-plugin-pwa/
    },
    { name: 'injectManifest strategy', pattern: /strategies.*injectManifest/ },
    { name: 'Custom service worker', pattern: /filename.*sw\.ts/ },
    { name: 'Manifest configuration', pattern: /manifest.*{/ },
    { name: 'Dev options enabled', pattern: /devOptions.*enabled.*true/ }
  ];

  viteChecks.forEach((check) => {
    const hasFeature = check.pattern.test(viteConfig);
    logTest(
      `Vite ${check.name}`,
      hasFeature ? 'PASS' : 'WARN',
      hasFeature ? 'Configured' : 'Not found or different configuration'
    );
  });
} else {
  logTest('vite.config.ts exists', 'FAIL', 'Configuration file not found');
}

// 7. Check package.json dependencies
console.log('\n📦 Validating Dependencies');
console.log('--------------------------');

const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    'vite-plugin-pwa',
    'workbox-precaching',
    'workbox-routing',
    'workbox-strategies'
  ];

  requiredDeps.forEach((dep) => {
    if (deps[dep]) {
      logTest(`Dependency ${dep}`, 'PASS', `Version: ${deps[dep]}`);
    } else {
      logTest(`Dependency ${dep}`, 'FAIL', 'Missing required dependency');
    }
  });
} else {
  logTest('package.json exists', 'FAIL', 'Package file not found');
}

// 8. Performance and optimization checks
console.log('\n🚀 Performance & Optimization Checks');
console.log('------------------------------------');

// Check for code splitting
const assetsDir = path.join(distPath, 'assets');
if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));
  const cssFiles = assetFiles.filter((f) => f.endsWith('.css'));

  logTest(
    'Code splitting',
    jsFiles.length > 5 ? 'PASS' : 'WARN',
    `${jsFiles.length} JS chunks generated`
  );

  logTest(
    'CSS optimization',
    cssFiles.length > 0 ? 'PASS' : 'WARN',
    `${cssFiles.length} CSS files generated`
  );

  // Check for vendor chunks
  const hasVendorChunks = jsFiles.some((f) => f.includes('vendor'));
  logTest(
    'Vendor chunks',
    hasVendorChunks ? 'PASS' : 'WARN',
    hasVendorChunks
      ? 'Vendor code separated'
      : 'Consider manual chunk splitting'
  );
}

// Final summary
console.log('\n📊 Test Summary');
console.log('===============');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📝 Total Tests: ${results.tests.length}`);

const successRate = ((results.passed / results.tests.length) * 100).toFixed(1);
console.log(`🎯 Success Rate: ${successRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 PWA Implementation Status: EXCELLENT');
  console.log('Your PWA is ready for production deployment!');
} else if (results.failed <= 2) {
  console.log('\n✨ PWA Implementation Status: GOOD');
  console.log('Minor issues detected. Review failed tests above.');
} else {
  console.log('\n🔧 PWA Implementation Status: NEEDS WORK');
  console.log('Several issues detected. Please address failed tests.');
}

// Recommendations
console.log('\n💡 Recommendations');
console.log('------------------');
console.log('1. Test PWA installation on mobile devices');
console.log('2. Verify offline functionality with network disabled');
console.log('3. Run Lighthouse PWA audit for detailed analysis');
console.log('4. Test background sync when app regains connectivity');
console.log('5. Validate push notifications (if implemented)');

console.log('\n🌐 Next Steps');
console.log('-------------');
console.log('1. Run: npm run preview');
console.log('2. Open: http://localhost:4173');
console.log('3. Test PWA installation in browser');
console.log('4. Use DevTools > Application > Service Workers to debug');
console.log('5. Test offline mode in DevTools > Network > Offline');

process.exit(results.failed > 0 ? 1 : 0);
