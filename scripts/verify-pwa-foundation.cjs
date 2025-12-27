#!/usr/bin/env node

// PWA Foundation Verification Script
// This script verifies that all PWA foundation components are properly set up

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PWA Foundation Setup...\n');

let score = 0;
let totalTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  const status = condition ? '✅' : '❌';
  const result = condition ? 'PASS' : 'FAIL';
  console.log(`${status} ${name}: ${result}`);
  if (details && !condition) {
    console.log(`   ${details}`);
  }
  if (condition) score++;
  return condition;
}

// Test 1: Check if manifest.json exists and has required fields
function testManifest() {
  try {
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return test(
        'Manifest File',
        false,
        'manifest.json not found in public directory'
      );
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const requiredFields = [
      'name',
      'short_name',
      'start_url',
      'display',
      'theme_color',
      'background_color',
      'icons'
    ];
    const hasAllFields = requiredFields.every(
      (field) => manifest[field] !== undefined
    );

    if (!hasAllFields) {
      const missingFields = requiredFields.filter(
        (field) => manifest[field] === undefined
      );
      return test(
        'Manifest Required Fields',
        false,
        `Missing fields: ${missingFields.join(', ')}`
      );
    }

    test('Manifest File', true);
    test('Manifest Required Fields', true);

    // Check icons
    const hasRequiredIcons =
      manifest.icons &&
      manifest.icons.some((icon) => icon.sizes === '192x192') &&
      manifest.icons.some((icon) => icon.sizes === '512x512');

    return test(
      'Manifest Icons',
      hasRequiredIcons,
      'Missing required 192x192 or 512x512 icons'
    );
  } catch (error) {
    return test(
      'Manifest File',
      false,
      `Error reading manifest: ${error.message}`
    );
  }
}

// Test 2: Check if service worker exists
function testServiceWorker() {
  const swPath = path.join(__dirname, '../public/sw.js');
  const exists = fs.existsSync(swPath);

  if (!exists) {
    return test(
      'Service Worker File',
      false,
      'sw.js not found in public directory'
    );
  }

  try {
    const swContent = fs.readFileSync(swPath, 'utf8');
    const hasInstallEvent = swContent.includes("addEventListener('install'");
    const hasActivateEvent = swContent.includes("addEventListener('activate'");
    const hasFetchEvent = swContent.includes("addEventListener('fetch'");

    test('Service Worker File', true);
    test(
      'Service Worker Install Event',
      hasInstallEvent,
      'Missing install event listener'
    );
    test(
      'Service Worker Activate Event',
      hasActivateEvent,
      'Missing activate event listener'
    );
    return test(
      'Service Worker Fetch Event',
      hasFetchEvent,
      'Missing fetch event listener'
    );
  } catch (error) {
    return test(
      'Service Worker File',
      false,
      `Error reading service worker: ${error.message}`
    );
  }
}

// Test 3: Check HTML file for PWA meta tags
function testHTMLMetaTags() {
  try {
    const htmlPath = path.join(__dirname, '../index.html');
    if (!fs.existsSync(htmlPath)) {
      return test('HTML File', false, 'index.html not found');
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const hasViewport =
      htmlContent.includes('name="viewport"') &&
      htmlContent.includes('width=device-width');
    const hasThemeColor = htmlContent.includes('name="theme-color"');
    const hasManifestLink = htmlContent.includes('rel="manifest"');
    const hasAppleMeta = htmlContent.includes('apple-mobile-web-app-capable');

    test('HTML File', true);
    test(
      'Viewport Meta Tag',
      hasViewport,
      'Missing or incorrect viewport meta tag'
    );
    test('Theme Color Meta Tag', hasThemeColor, 'Missing theme-color meta tag');
    test('Manifest Link', hasManifestLink, 'Missing manifest link tag');
    return test(
      'Apple PWA Meta Tags',
      hasAppleMeta,
      'Missing Apple PWA meta tags'
    );
  } catch (error) {
    return test(
      'HTML File',
      false,
      `Error reading HTML file: ${error.message}`
    );
  }
}

// Test 4: Check Vite PWA configuration
function testViteConfig() {
  try {
    const vitePath = path.join(__dirname, '../vite.config.ts');
    if (!fs.existsSync(vitePath)) {
      return test('Vite Config', false, 'vite.config.ts not found');
    }

    const viteContent = fs.readFileSync(vitePath, 'utf8');
    const hasPWAPlugin = viteContent.includes('VitePWA');
    const hasWorkboxConfig = viteContent.includes('workbox');

    test('Vite Config', true);
    test('Vite PWA Plugin', hasPWAPlugin, 'VitePWA plugin not configured');
    return test(
      'Workbox Configuration',
      hasWorkboxConfig,
      'Workbox configuration missing'
    );
  } catch (error) {
    return test(
      'Vite Config',
      false,
      `Error reading vite config: ${error.message}`
    );
  }
}

// Test 5: Check PWA utility files
function testPWAUtilities() {
  const pwaLibPath = path.join(__dirname, '../src/lib/pwa.ts');
  const pwaTestPath = path.join(__dirname, '../src/utils/pwa-test.ts');
  const pwaComponentPath = path.join(
    __dirname,
    '../src/components/PWAStatus.tsx'
  );

  const hasLib = fs.existsSync(pwaLibPath);
  const hasTest = fs.existsSync(pwaTestPath);
  const hasComponent = fs.existsSync(pwaComponentPath);

  test('PWA Library', hasLib, 'PWA utility library not found');
  test('PWA Test Utilities', hasTest, 'PWA test utilities not found');
  return test(
    'PWA Status Component',
    hasComponent,
    'PWA status component not found'
  );
}

// Test 6: Check main.tsx for PWA initialization
function testMainTSX() {
  try {
    const mainPath = path.join(__dirname, '../src/main.tsx');
    if (!fs.existsSync(mainPath)) {
      return test('Main TSX File', false, 'main.tsx not found');
    }

    const mainContent = fs.readFileSync(mainPath, 'utf8');
    const hasPWAImport =
      mainContent.includes('./lib/pwa') ||
      mainContent.includes('./utils/pwa-test');

    test('Main TSX File', true);
    return test(
      'PWA Initialization',
      hasPWAImport,
      'PWA initialization not found in main.tsx'
    );
  } catch (error) {
    return test(
      'Main TSX File',
      false,
      `Error reading main.tsx: ${error.message}`
    );
  }
}

// Run all tests
console.log('Running PWA Foundation Tests:\n');

testManifest();
testServiceWorker();
testHTMLMetaTags();
testViteConfig();
testPWAUtilities();
testMainTSX();

// Calculate and display results
const percentage = Math.round((score / totalTests) * 100);

console.log('\n' + '='.repeat(50));
console.log(
  `📊 PWA Foundation Score: ${percentage}% (${score}/${totalTests} tests passed)`
);

if (percentage === 100) {
  console.log('🎉 Excellent! PWA Foundation setup is complete!');
} else if (percentage >= 80) {
  console.log('✅ Good! PWA Foundation is mostly ready with minor issues.');
} else if (percentage >= 60) {
  console.log('⚠️  Fair. PWA Foundation needs some improvements.');
} else {
  console.log('❌ Poor. PWA Foundation needs significant work.');
}

console.log('\nNext Steps:');
console.log('1. Run "npm run dev" to test PWA in development');
console.log('2. Run "npm run build" to create production PWA');
console.log('3. Test PWA installation in Chrome DevTools');
console.log('4. Run Lighthouse audit to verify 100% PWA score');

process.exit(percentage === 100 ? 0 : 1);
