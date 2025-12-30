// Utility functions for testing offline functionality
// This file helps verify that API responses are being cached to IndexedDB

import { getOfflineDB } from './offline-db';
import { getOfflineAPIInterceptor } from './offline-api-interceptor';

export class OfflineTestUtils {
  private offlineDB = getOfflineDB();
  private interceptor = getOfflineAPIInterceptor();

  // Test if data is being cached from API responses
  async testAPICaching(): Promise<{
    success: boolean;
    message: string;
    details: any;
  }> {
    try {
      // Get current counts of cached data
      const attendanceCount = (await this.offlineDB.getAll('attendance'))
        .length;
      const timetableCount = (await this.offlineDB.getAll('timetables')).length;
      const resultsCount = (await this.offlineDB.getAll('results')).length;
      const circularsCount = (await this.offlineDB.getAll('circulars')).length;

      const details = {
        cachedData: {
          attendance: attendanceCount,
          timetables: timetableCount,
          results: resultsCount,
          circulars: circularsCount
        },
        totalCachedItems:
          attendanceCount + timetableCount + resultsCount + circularsCount
      };

      if (details.totalCachedItems > 0) {
        return {
          success: true,
          message: `API caching is working! Found ${details.totalCachedItems} cached items in IndexedDB.`,
          details
        };
      } else {
        return {
          success: false,
          message:
            'No cached data found. API responses may not be caching to IndexedDB yet.',
          details
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error testing API caching: ${error}`,
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  // Test offline data retrieval
  async testOfflineRetrieval(endpoint: string): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    try {
      const cachedData = await this.interceptor.getCachedData(endpoint);

      return {
        success: true,
        message: `Retrieved ${cachedData.length} items from offline cache for ${endpoint}`,
        data: cachedData
      };
    } catch (error) {
      return {
        success: false,
        message: `Error retrieving offline data for ${endpoint}: ${error}`,
        data: []
      };
    }
  }

  // Get database statistics
  async getDatabaseStats(): Promise<{
    stores: { storeName: string; count: number }[];
    totalItems: number;
  }> {
    try {
      const stores = await this.offlineDB.getDatabaseSize();
      const totalItems = stores.reduce((sum, store) => sum + store.count, 0);

      return { stores, totalItems };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { stores: [], totalItems: 0 };
    }
  }

  // Clear all cached data (for testing)
  async clearAllCachedData(): Promise<void> {
    try {
      await this.offlineDB.clear('attendance');
      await this.offlineDB.clear('timetables');
      await this.offlineDB.clear('results');
      await this.offlineDB.clear('circulars');
      console.log('All cached data cleared');
    } catch (error) {
      console.error('Error clearing cached data:', error);
    }
  }
}

// Singleton instance
let testUtilsInstance: OfflineTestUtils | null = null;

export function getOfflineTestUtils(): OfflineTestUtils {
  if (!testUtilsInstance) {
    testUtilsInstance = new OfflineTestUtils();
  }
  return testUtilsInstance;
}

// Console helper functions for easy testing
if (typeof window !== 'undefined') {
  (window as any).testOfflineCache = async () => {
    const utils = getOfflineTestUtils();
    const result = await utils.testAPICaching();
    console.log('🔍 Offline Cache Test:', result);
    return result;
  };

  (window as any).getOfflineStats = async () => {
    const utils = getOfflineTestUtils();
    const stats = await utils.getDatabaseStats();
    console.log('📊 Database Stats:', stats);
    return stats;
  };

  (window as any).clearOfflineCache = async () => {
    const utils = getOfflineTestUtils();
    await utils.clearAllCachedData();
    console.log('🗑️ Offline cache cleared');
  };
}
