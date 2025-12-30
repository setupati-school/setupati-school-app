// Offline Database Validation Utility
// This utility helps validate that the IndexedDB fixes are working correctly in the browser

import { getOfflineDB, type AttendanceRecord } from './offline-db';

export class OfflineDBValidator {
  private offlineDB = getOfflineDB();

  async validateIndexedDBFixes(): Promise<{
    success: boolean;
    errors: string[];
    results: Record<string, any>;
  }> {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    try {
      console.log('🔍 Starting IndexedDB validation...');

      // Test 1: Create a test attendance record with numeric synced field
      const testAttendance: AttendanceRecord = {
        id: `test-${Date.now()}`,
        studentId: 'test-student-123',
        date: '2024-01-15',
        status: 'present',
        subject: 'Mathematics',
        synced: 0, // Should be numeric 0
        lastModified: Date.now()
      };

      await this.offlineDB.saveAttendance(testAttendance);
      results.attendanceSaved = true;
      console.log('✅ Test attendance record saved successfully');

      // Test 2: Query unsynced records (should work without errors)
      const unsyncedAttendance = await this.offlineDB.getUnsyncedAttendance();
      results.unsyncedQuery = {
        success: true,
        count: unsyncedAttendance.length,
        hasTestRecord: unsyncedAttendance.some(
          (a) => a.id === testAttendance.id
        )
      };
      console.log(
        `✅ Unsynced attendance query successful: ${unsyncedAttendance.length} records`
      );

      // Test 3: Mark record as synced
      await this.offlineDB.markAsSynced('attendance', testAttendance.id);
      results.markAsSynced = true;
      console.log('✅ Record marked as synced successfully');

      // Test 4: Verify record is no longer in unsynced query
      const unsyncedAfterSync = await this.offlineDB.getUnsyncedAttendance();
      const stillUnsynced = unsyncedAfterSync.some(
        (a) => a.id === testAttendance.id
      );
      results.syncVerification = {
        success: !stillUnsynced,
        unsyncedCount: unsyncedAfterSync.length
      };

      if (stillUnsynced) {
        errors.push(
          'Record still appears in unsynced query after marking as synced'
        );
      } else {
        console.log(
          '✅ Sync verification successful - record no longer in unsynced query'
        );
      }

      // Test 5: Test other store types
      const storeTests = ['timetables', 'results', 'circulars', 'userProfile'];
      for (const store of storeTests) {
        try {
          const unsyncedItems = await this.offlineDB.getByIndex(
            store,
            'synced',
            0
          );
          results[`${store}Query`] = {
            success: true,
            count: unsyncedItems.length
          };
          console.log(
            `✅ ${store} unsynced query successful: ${unsyncedItems.length} records`
          );
        } catch (error) {
          errors.push(`Failed to query ${store}: ${error}`);
          results[`${store}Query`] = { success: false, error: String(error) };
        }
      }

      // Cleanup test record
      await this.offlineDB.delete('attendance', testAttendance.id);
      console.log('🧹 Test record cleaned up');

      const success = errors.length === 0;
      console.log(
        success
          ? '🎉 All IndexedDB validation tests passed!'
          : '❌ Some validation tests failed'
      );

      return { success, errors, results };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(`Validation failed: ${errorMessage}`);
      console.error('❌ IndexedDB validation failed:', error);

      return { success: false, errors, results };
    }
  }

  async logDatabaseStatus(): Promise<void> {
    try {
      const sizes = await this.offlineDB.getDatabaseSize();
      console.log('📊 Database Status:');
      sizes.forEach(({ storeName, count }) => {
        console.log(`  ${storeName}: ${count} records`);
      });
    } catch (error) {
      console.error('Failed to get database status:', error);
    }
  }
}

// Export a function to run validation from browser console
export async function validateOfflineDB(): Promise<void> {
  const validator = new OfflineDBValidator();
  const result = await validator.validateIndexedDBFixes();

  if (result.success) {
    console.log('✅ IndexedDB validation completed successfully!');
  } else {
    console.error('❌ IndexedDB validation failed:');
    result.errors.forEach((error) => console.error(`  - ${error}`));
  }

  console.log('📋 Validation Results:', result.results);
  await validator.logDatabaseStatus();
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).validateOfflineDB = validateOfflineDB;

  // Import and expose cache debug functions
  import('./cache-debug')
    .then(({ debugCache, testCaching, clearCache }) => {
      (window as any).debugCache = debugCache;
      (window as any).testCaching = testCaching;
      (window as any).clearCache = clearCache;
    })
    .catch(() => {
      // Silently fail if cache-debug is not available
    });
}
