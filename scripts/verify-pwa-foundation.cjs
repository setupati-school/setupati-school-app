// PWA Foundation Verification Script
// Setupati School Management System PWA

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

console.log(chalk.blue.bold('🔍 PWA Foundation Verification'));
console.log(chalk.gray('Checking PWA implementation...\n'));

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

// Check Vite PWA configuration
console.log(chalk.cyan.bold('📦 Vite PWA Configuration'));
try {
  const viteConfig = fs.readFileSync(
    path.join(__dirname, '../vite.config.ts'),
    'utf8'
  );

  if (viteConfig.includes('VitePWA')) {
    checkPassed('Vite PWA plugin is configured');
  } else {
    checkFailed('Vite PWA plugin not found in configuration');
  }

  if (viteConfig.includes('injectManifest')) {
    checkPassed('Using injectManifest strategy for custom service worker');
  } else {
    checkWarning(
      'Not using injectManifest strategy - may limit offline functionality'
    );
  }

  if (viteConfig.includes("registerType: 'prompt'")) {
    checkPassed('PWA registration set to prompt mode');
  } else {
    checkWarning('PWA registration not set to prompt mode');
  }
} catch (error) {
  checkFailed('Could not read vite.config.ts');
}

// Check service worker implementation
console.log(chalk.cyan.bold('\n🔧 Service Worker Implementation'));
try {
  const swPath = path.join(__dirname, '../src/sw.ts');
  if (fs.existsSync(swPath)) {
    checkPassed('Custom service worker found at src/sw.ts');

    const swContent = fs.readFileSync(swPath, 'utf8');

    if (swContent.includes('precacheAndRoute')) {
      checkPassed('Workbox precaching implemented');
    } else {
      checkFailed('Workbox precaching not found');
    }

    if (swContent.includes('registerRoute')) {
      checkPassed('Custom routing strategies implemented');
    } else {
      checkFailed('Custom routing strategies not found');
    }

    if (swContent.includes('background-sync')) {
      checkPassed('Background sync functionality implemented');
    } else {
      checkFailed('Background sync functionality not found');
    }

    if (swContent.includes('IndexedDB')) {
      checkPassed('IndexedDB integration found');
    } else {
      checkWarning('IndexedDB integration not found in service worker');
    }
  } else {
    checkFailed('Custom service worker not found at src/sw.ts');
  }
} catch (error) {
  checkFailed('Error checking service worker implementation');
}

// Check offline functionality
console.log(chalk.cyan.bold('\n💾 Offline Functionality'));
try {
  const offlineDbPath = path.join(__dirname, '../src/lib/offline-db.ts');
  if (fs.existsSync(offlineDbPath)) {
    checkPassed('Offline database implementation found');

    const dbContent = fs.readFileSync(offlineDbPath, 'utf8');

    if (dbContent.includes('IndexedDB')) {
      checkPassed('IndexedDB implementation found');
    } else {
      checkFailed('IndexedDB implementation not found');
    }

    if (dbContent.includes('SyncQueueItem')) {
      checkPassed('Sync queue implementation found');
    } else {
      checkFailed('Sync queue implementation not found');
    }
  } else {
    checkFailed('Offline database implementation not found');
  }

  const syncManagerPath = path.join(__dirname, '../src/lib/sync-manager.ts');
  if (fs.existsSync(syncManagerPath)) {
    checkPassed('Background sync manager found');
  } else {
    checkFailed('Background sync manager not found');
  }

  const offlineManagerPath = path.join(
    __dirname,
    '../src/lib/offline-manager.ts'
  );
  if (fs.existsSync(offlineManagerPath)) {
    checkPassed('Offline manager found');
  } else {
    checkFailed('Offline manager not found');
  }
} catch (error) {
  checkFailed('Error checking offline functionality');
}

// Check React integration
console.log(chalk.cyan.bold('\n⚛️ React Integration'));
try {
  const appPath = path.join(__dirname, '../src/App.tsx');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');

    if (appContent.includes('useRegisterSW')) {
      checkPassed('Vite PWA React hook integrated');
    } else {
      checkFailed('Vite PWA React hook not found');
    }

    if (appContent.includes('getOfflineManager')) {
      checkPassed('Offline manager integrated in App');
    } else {
      checkFailed('Offline manager not integrated in App');
    }

    if (appContent.includes('OfflineIndicator')) {
      checkPassed('Offline indicator component integrated');
    } else {
      checkWarning('Offline indicator component not found');
    }
  } else {
    checkFailed('App.tsx not found');
  }

  const useOfflinePath = path.join(__dirname, '../src/hooks/useOffline.ts');
  if (fs.existsSync(useOfflinePath)) {
    checkPassed('useOffline hook implemented');
  } else {
    checkFailed('useOffline hook not found');
  }
} catch (error) {
  checkFailed('Error checking React integration');
}

// Check PWA assets
console.log(chalk.cyan.bold('\n🎨 PWA Assets'));
try {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  if (fs.existsSync(manifestPath)) {
    checkWarning(
      'Static manifest.json found - will be overridden by Vite PWA plugin'
    );
  }

  const iconPath = path.join(__dirname, '../public/school.png');
  if (fs.existsSync(iconPath)) {
    checkPassed('PWA icon found at public/school.png');
  } else {
    checkFailed('PWA icon not found at public/school.png');
  }

  // Check if old service worker exists
  const oldSwPath = path.join(__dirname, '../public/sw.js');
  if (fs.existsSync(oldSwPath)) {
    checkWarning(
      'Old service worker found at public/sw.js - should be removed'
    );
  } else {
    checkPassed('No conflicting service worker in public directory');
  }
} catch (error) {
  checkFailed('Error checking PWA assets');
}

// Summary
console.log(chalk.cyan.bold('\n📊 Summary'));
console.log(chalk.green(`✓ Passed: ${passed}`));
console.log(chalk.red(`✗ Failed: ${failed}`));

if (failed === 0) {
  console.log(chalk.green.bold('\n🎉 PWA foundation is properly implemented!'));
  console.log(chalk.gray('Next steps:'));
  console.log(
    chalk.gray('1. Run `npm run build` to test the production build')
  );
  console.log(chalk.gray('2. Run `npm run preview` to test the PWA locally'));
  console.log(chalk.gray('3. Use Lighthouse to audit PWA compliance'));
} else {
  console.log(
    chalk.red.bold('\n❌ PWA foundation has issues that need to be addressed.')
  );
  console.log(chalk.gray('Please fix the failed checks above.'));
}

console.log(chalk.gray('\n' + '='.repeat(50)));

process.exit(failed > 0 ? 1 : 0);
