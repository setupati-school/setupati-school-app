// Cache Debug Utility
// This utility helps debug IndexedDB caching issues

import { getOfflineDB } from './offline-db';
import { getOfflineAPIInterceptor } from './offline-api-interceptor';

export class CacheDebugger {
  private offlineDB = getOfflineDB();
  private interceptor = getOfflineAPIInterceptor();

  async debugCacheStatus(): Promise<void> {
    console.log('🔍 Cache Debug Status:');

    try {
      // Check database size
      const sizes = await this.offlineDB.getDatabaseSize();
      console.log('📊 IndexedDB Status:');
      sizes.forEach(({ storeName, count }) => {
        console.log(`  ${storeName}: ${count} records`);
      });

      // Check specific stores
      const circulars = await this.offlineDB.getAll('circulars');
      const timetables = await this.offlineDB.getAll('timetables');
      const attendance = await this.offlineDB.getAll('attendance');
      const results = await this.offlineDB.getAll('results');

      console.log('\n📋 Detailed Cache Contents:');
      console.log('Circulars:', circulars);
      console.log('Timetables:', timetables);
      console.log('Attendance:', attendance);
      console.log('Results:', results);
    } catch (error) {
      console.error('❌ Cache debug failed:', error);
    }
  }

  async testCircularTransformation(sampleData: any): Promise<void> {
    console.log('🧪 Testing Circular Transformation:');
    console.log('Input data:', sampleData);

    try {
      // Access the private method through reflection
      const interceptor = this.interceptor as any;
      const transformed = await interceptor.transformCircularData(
        sampleData,
        '/circulars/all'
      );
      console.log('Transformed data:', transformed);

      if (transformed.length > 0) {
        console.log('✅ Transformation successful');

        // Try to save to IndexedDB
        await this.offlineDB.bulkSave('circulars', transformed);
        console.log('✅ Successfully saved to IndexedDB');

        // Verify it was saved
        const saved = await this.offlineDB.getAll('circulars');
        console.log('📋 Verified saved data:', saved);
      } else {
        console.log('❌ Transformation returned empty array');
      }
    } catch (error) {
      console.error('❌ Transformation test failed:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    console.log('🧹 Clearing all cache...');

    try {
      await this.offlineDB.clear('circulars');
      await this.offlineDB.clear('timetables');
      await this.offlineDB.clear('attendance');
      await this.offlineDB.clear('results');
      await this.offlineDB.clear('userProfile');
      await this.offlineDB.clear('syncQueue');

      console.log('✅ All cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  async testManualCaching(): Promise<void> {
    console.log('🔧 Testing manual caching...');

    // Sample circular data matching your API format
    const sampleCircularData = {
      circulars: [
        {
          id: 'test-circular-1',
          title: 'Test Circular',
          content: 'This is a test circular for debugging',
          issued_date: '2025-01-01',
          priority: 'high',
          target_audience: ['students', 'parents'],
          attachments: []
        }
      ]
    };

    await this.testCircularTransformation(sampleCircularData);
  }
}

// Export debug functions for browser console
export async function debugCache(): Promise<void> {
  const cacheDebugger = new CacheDebugger();
  await cacheDebugger.debugCacheStatus();
}

export async function testCaching(): Promise<void> {
  const cacheDebugger = new CacheDebugger();
  await cacheDebugger.testManualCaching();
}

export async function clearCache(): Promise<void> {
  const cacheDebugger = new CacheDebugger();
  await cacheDebugger.clearAllCache();
}

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).debugCache = debugCache;
  (window as any).testCaching = testCaching;
  (window as any).clearCache = clearCache;
}
