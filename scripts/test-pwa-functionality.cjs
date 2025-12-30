// PWA Functionality Test Script
// Setupati School Management System PWA

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

console.log(chalk.blue.bold('🧪 PWA Functionality Test'));
console.log(chalk.gray('Testing PWA build artifacts...\n'));

let passed = 0;
let failed = 0;

function checkPassed(message) {
  console.log(chalk.green('✓'), message);
  passed++;
}

function checkFailed(message) {
  console.log(chalk.red('✗'), message);
  failed++;
}

function checkWarning(message) {
  console.log(chalk.yellow('⚠'), message);
}

// Check build artifacts
console.log(chalk.cyan.bold('📦 Build Artifacts'));
try {
  const distPath = path.join(__dirname, '../dist');

  if (fs.existsSync(distPath)) {
    checkPassed('dist directory exists');

    // Check for service worker
    const swPath = path.join(distPath, 'sw.js');
    if (fs.existsSync(swPath)) {
      checkPassed('Service worker generated at dist/sw.js');

      const swContent = fs.readFileSync(swPath, 'utf8');
      if (
        swContent.includes('precacheAndRoute') ||
        swContent.includes('precache')
      ) {
        checkPassed('Service worker contains Workbox precaching');
      } else {
        checkFailed('Service worker missing Workbox precaching');
      }

      if (swContent.includes('background-sync')) {
        checkPassed('Service worker contains background sync');
      } else {
        checkFailed('Service worker missing background sync');
      }
    } else {
      checkFailed('Service worker not found at dist/sw.js');
    }

    // Check for manifest
    const manifestPath = path.join(distPath, 'manifest.webmanifest');
    if (fs.existsSync(manifestPath)) {
      checkPassed('Web app manifest generated');

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      if (manifest.name && manifest.name.includes('Setupati School')) {
        checkPassed('Manifest contains correct app name');
      } else {
        checkFailed('Manifest missing or incorrect app name');
      }

      if (manifest.icons && manifest.icons.length > 0) {
        checkPassed(`Manifest contains ${manifest.icons.length} icons`);
      } else {
        checkFailed('Manifest missing icons');
      }

      if (manifest.display === 'standalone') {
        checkPassed('Manifest configured for standalone display');
      } else {
        checkWarning('Manifest not configured for standalone display');
      }

      if (manifest.start_url) {
        checkPassed('Manifest has start_url configured');
      } else {
        checkFailed('Manifest missing start_url');
      }
    } else {
      checkFailed('Web app manifest not found');
    }

    // Check for index.html
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      checkPassed('index.html generated');

      const indexContent = fs.readFileSync(indexPath, 'utf8');
      if (indexContent.includes('manifest.webmanifest')) {
        checkPassed('index.html links to web app manifest');
      } else {
        checkFailed('index.html missing manifest link');
      }

      if (indexContent.includes('theme-color')) {
        checkPassed('index.html has theme-color meta tag');
      } else {
        checkWarning('index.html missing theme-color meta tag');
      }
    } else {
      checkFailed('index.html not found');
    }

    // Check assets
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      const assets = fs.readdirSync(assetsPath);
      const jsFiles = assets.filter((file) => file.endsWith('.js'));
      const cssFiles = assets.filter((file) => file.endsWith('.css'));

      checkPassed(`Generated ${jsFiles.length} JavaScript files`);
      checkPassed(`Generated ${cssFiles.length} CSS files`);

      // Check for chunking
      const vendorChunks = jsFiles.filter((file) => file.includes('vendor'));
      if (vendorChunks.length > 0) {
        checkPassed(`Code splitting: ${vendorChunks.length} vendor chunks`);
      } else {
        checkWarning('No vendor chunks found - may impact caching');
      }
    } else {
      checkFailed('Assets directory not found');
    }
  } else {
    checkFailed('dist directory not found - run build first');
  }
} catch (error) {
  checkFailed(`Error checking build artifacts: ${error.message}`);
}

// Check source files
console.log(chalk.cyan.bold('\n📁 Source Files'));
try {
  // Check offline functionality files
  const offlineFiles = [
    'src/lib/offline-db.ts',
    'src/lib/sync-manager.ts',
    'src/lib/offline-manager.ts',
    'src/hooks/useOffline.ts',
    'src/components/OfflineIndicator.tsx'
  ];

  offlineFiles.forEach((file) => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      checkPassed(`${file} exists`);
    } else {
      checkFailed(`${file} missing`);
    }
  });

  // Check service worker source
  const swSourcePath = path.join(__dirname, '../src/sw.ts');
  if (fs.existsSync(swSourcePath)) {
    checkPassed('Service worker source (src/sw.ts) exists');
  } else {
    checkFailed('Service worker source missing');
  }
} catch (error) {
  checkFailed(`Error checking source files: ${error.message}`);
}

// Summary
console.log(chalk.cyan.bold('\n📊 Test Summary'));
console.log(chalk.green(`✓ Passed: ${passed}`));
console.log(chalk.red(`✗ Failed: ${failed}`));

if (failed === 0) {
  console.log(chalk.green.bold('\n🎉 PWA functionality test passed!'));
  console.log(chalk.gray('Your PWA is ready for deployment.'));
  console.log(chalk.gray('\nNext steps:'));
  console.log(chalk.gray('1. Test the app at http://localhost:4173/'));
  console.log(chalk.gray('2. Open DevTools > Application > Service Workers'));
  console.log(chalk.gray('3. Test offline functionality by going offline'));
  console.log(chalk.gray('4. Test install prompt on mobile devices'));
  console.log(chalk.gray('5. Run Lighthouse audit for PWA compliance'));
} else {
  console.log(chalk.red.bold('\n❌ PWA functionality test failed.'));
  console.log(chalk.gray('Please fix the failed checks above.'));
}

console.log(chalk.gray('\n' + '='.repeat(50)));

process.exit(failed > 0 ? 1 : 0);
