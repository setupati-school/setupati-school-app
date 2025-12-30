// Background Sync Manager for Offline Data Synchronization
// Setupati School Management System PWA

import {
  getOfflineDB,
  type SyncQueueItem,
  type AttendanceRecord,
  type TimetableRecord,
  type ExamResultRecord,
  type CircularRecord,
  type UserProfile
} from './offline-db';

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
}

export interface SyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  batchSize?: number;
  timeout?: number;
}

export class BackgroundSyncManager {
  private offlineDB = getOfflineDB();
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private syncOptions: Required<SyncOptions>;

  constructor(options: SyncOptions = {}) {
    this.syncOptions = {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      batchSize: options.batchSize || 10,
      timeout: options.timeout || 30000
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('SyncManager: Device came online, triggering sync');
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('SyncManager: Device went offline');
    });

    // Listen for visibility change to sync when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        console.log('SyncManager: App became visible, checking for sync');
        this.triggerBackgroundSync();
      }
    });
  }

  // Queue offline actions for later synchronization
  async queueAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    endpoint: string,
    data: any
  ): Promise<string> {
    console.log(`SyncManager: Queuing ${action} action for ${endpoint}`);

    const syncId = await this.offlineDB.addToSyncQueue({
      action,
      endpoint,
      data,
      maxRetries: this.syncOptions.maxRetries
    });

    // Try immediate sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.triggerBackgroundSync();
    }

    return syncId;
  }

  // Trigger background sync (can be called from service worker)
  async triggerBackgroundSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      console.log('SyncManager: Sync skipped - offline or already in progress');
      return;
    }

    console.log('SyncManager: Starting background sync');
    this.syncInProgress = true;

    try {
      // Register background sync with service worker if available
      if (
        'serviceWorker' in navigator &&
        'sync' in window.ServiceWorkerRegistration.prototype
      ) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
      }

      // Perform immediate sync
      await this.performSync();
    } catch (error) {
      console.error('SyncManager: Background sync failed', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Main sync operation
  async performSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      errors: []
    };

    try {
      console.log('SyncManager: Starting sync operation');

      // Get all pending sync items
      const syncQueue = await this.offlineDB.getSyncQueue();
      console.log(`SyncManager: Found ${syncQueue.length} items in sync queue`);

      if (syncQueue.length === 0) {
        return result;
      }

      // Process items in batches
      const batches = this.createBatches(syncQueue, this.syncOptions.batchSize);

      for (const batch of batches) {
        const batchResult = await this.processBatch(batch);
        result.syncedItems += batchResult.syncedItems;
        result.failedItems += batchResult.failedItems;
        result.errors.push(...batchResult.errors);
      }

      // Sync unsynced data from local stores
      await this.syncUnsyncedData(result);

      console.log(
        `SyncManager: Sync completed - ${result.syncedItems} synced, ${result.failedItems} failed`
      );

      if (result.failedItems > 0) {
        result.success = false;
      }
    } catch (error) {
      console.error('SyncManager: Sync operation failed', error);
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown sync error'
      );
    }

    return result;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(batch: SyncQueueItem[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      errors: []
    };

    const promises = batch.map((item) => this.processSyncItem(item));
    const results = await Promise.allSettled(promises);

    results.forEach((promiseResult, index) => {
      const item = batch[index];

      if (promiseResult.status === 'fulfilled' && promiseResult.value) {
        result.syncedItems++;
        // Remove successful item from queue
        this.offlineDB.removeSyncItem(item.id).catch(console.error);
      } else {
        result.failedItems++;
        const error =
          promiseResult.status === 'rejected'
            ? promiseResult.reason
            : 'Sync item processing failed';
        result.errors.push(`${item.endpoint}: ${error}`);

        // Update retry count
        this.handleFailedSyncItem(item, error).catch(console.error);
      }
    });

    return result;
  }

  private async processSyncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      console.log(
        `SyncManager: Processing ${item.action} for ${item.endpoint}`
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.syncOptions.timeout
      );

      const requestOptions: RequestInit = {
        method: this.getHttpMethod(item.action),
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      };

      if (item.action !== 'DELETE' && item.data) {
        requestOptions.body = JSON.stringify(item.data);
      }

      const response = await fetch(item.endpoint, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle response data if needed
      const responseData = await response.json().catch(() => null);

      // Update local data with server response if applicable
      if (responseData && item.action === 'CREATE') {
        await this.updateLocalDataWithServerResponse(item, responseData);
      }

      console.log(
        `SyncManager: Successfully synced ${item.action} for ${item.endpoint}`
      );
      return true;
    } catch (error) {
      console.error(
        `SyncManager: Failed to sync ${item.action} for ${item.endpoint}`,
        error
      );
      throw error;
    }
  }

  private getHttpMethod(action: 'CREATE' | 'UPDATE' | 'DELETE'): string {
    switch (action) {
      case 'CREATE':
        return 'POST';
      case 'UPDATE':
        return 'PUT';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'POST';
    }
  }

  private async updateLocalDataWithServerResponse(
    item: SyncQueueItem,
    responseData: any
  ): Promise<void> {
    try {
      // Update local data with server-generated IDs or updated fields
      if (item.endpoint.includes('/attendance') && responseData.id) {
        const localData = item.data as AttendanceRecord;
        localData.id = responseData.id;
        localData.synced = true;
        await this.offlineDB.put('attendance', localData);
      } else if (item.endpoint.includes('/timetable') && responseData.id) {
        const localData = item.data as TimetableRecord;
        localData.id = responseData.id;
        localData.synced = true;
        await this.offlineDB.put('timetables', localData);
      } else if (item.endpoint.includes('/examresult') && responseData.id) {
        const localData = item.data as ExamResultRecord;
        localData.id = responseData.id;
        localData.synced = true;
        await this.offlineDB.put('results', localData);
      } else if (item.endpoint.includes('/circular') && responseData.id) {
        const localData = item.data as CircularRecord;
        localData.id = responseData.id;
        localData.synced = true;
        await this.offlineDB.put('circulars', localData);
      }
    } catch (error) {
      console.warn(
        'SyncManager: Failed to update local data with server response',
        error
      );
    }
  }

  private async handleFailedSyncItem(
    item: SyncQueueItem,
    error: any
  ): Promise<void> {
    const updatedItem: Partial<SyncQueueItem> = {
      retryCount: item.retryCount + 1,
      lastError: error instanceof Error ? error.message : String(error)
    };

    if (updatedItem.retryCount! >= item.maxRetries) {
      console.warn(
        `SyncManager: Max retries reached for ${item.endpoint}, removing from queue`
      );
      await this.offlineDB.removeSyncItem(item.id);
    } else {
      console.log(
        `SyncManager: Retry ${updatedItem.retryCount}/${item.maxRetries} for ${item.endpoint}`
      );
      await this.offlineDB.updateSyncItem(item.id, updatedItem);
    }
  }

  // Sync unsynced data from local stores
  private async syncUnsyncedData(result: SyncResult): Promise<void> {
    try {
      // Sync attendance data
      const unsyncedAttendance = await this.offlineDB.getUnsyncedAttendance();
      for (const attendance of unsyncedAttendance) {
        try {
          await this.syncAttendanceRecord(attendance);
          result.syncedItems++;
        } catch (error) {
          result.failedItems++;
          result.errors.push(`Attendance sync failed: ${error}`);
        }
      }

      // Sync timetable data
      const unsyncedTimetables = await this.offlineDB.getUnsyncedTimetables();
      for (const timetable of unsyncedTimetables) {
        try {
          await this.syncTimetableRecord(timetable);
          result.syncedItems++;
        } catch (error) {
          result.failedItems++;
          result.errors.push(`Timetable sync failed: ${error}`);
        }
      }

      // Sync exam results
      const unsyncedResults = await this.offlineDB.getUnsyncedResults();
      for (const examResult of unsyncedResults) {
        try {
          await this.syncExamResultRecord(examResult);
          result.syncedItems++;
        } catch (error) {
          result.failedItems++;
          result.errors.push(`Exam result sync failed: ${error}`);
        }
      }

      // Sync circulars
      const unsyncedCirculars = await this.offlineDB.getUnsyncedCirculars();
      for (const circular of unsyncedCirculars) {
        try {
          await this.syncCircularRecord(circular);
          result.syncedItems++;
        } catch (error) {
          result.failedItems++;
          result.errors.push(`Circular sync failed: ${error}`);
        }
      }

      // Sync user profiles
      const unsyncedProfiles = await this.offlineDB.getUnsyncedProfiles();
      for (const profile of unsyncedProfiles) {
        try {
          await this.syncUserProfile(profile);
          result.syncedItems++;
        } catch (error) {
          result.failedItems++;
          result.errors.push(`Profile sync failed: ${error}`);
        }
      }
    } catch (error) {
      console.error('SyncManager: Failed to sync unsynced data', error);
      result.errors.push(`Unsynced data sync failed: ${error}`);
    }
  }

  private async syncAttendanceRecord(
    attendance: AttendanceRecord
  ): Promise<void> {
    const endpoint = `/api/attendance/${attendance.id}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendance)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await this.offlineDB.markAsSynced('attendance', attendance.id);
  }

  private async syncTimetableRecord(timetable: TimetableRecord): Promise<void> {
    const endpoint = `/api/timetable/${timetable.id}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timetable)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await this.offlineDB.markAsSynced('timetables', timetable.id);
  }

  private async syncExamResultRecord(result: ExamResultRecord): Promise<void> {
    const endpoint = `/api/examresult/${result.id}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await this.offlineDB.markAsSynced('results', result.id);
  }

  private async syncCircularRecord(circular: CircularRecord): Promise<void> {
    const endpoint = `/api/circular/${circular.id}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(circular)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await this.offlineDB.markAsSynced('circulars', circular.id);
  }

  private async syncUserProfile(profile: UserProfile): Promise<void> {
    const endpoint = `/api/user/${profile.id}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await this.offlineDB.markAsSynced('userProfile', profile.id);
  }

  // Public methods for manual sync operations
  async forceSyncAll(): Promise<SyncResult> {
    console.log('SyncManager: Force sync all data');
    this.syncInProgress = false; // Reset flag to allow sync
    return this.performSync();
  }

  async getSyncStatus(): Promise<{
    isOnline: boolean;
    syncInProgress: boolean;
    queueLength: number;
    unsyncedCounts: {
      attendance: number;
      timetables: number;
      results: number;
      circulars: number;
      profiles: number;
    };
  }> {
    const syncQueue = await this.offlineDB.getSyncQueue();
    const unsyncedAttendance = await this.offlineDB.getUnsyncedAttendance();
    const unsyncedTimetables = await this.offlineDB.getUnsyncedTimetables();
    const unsyncedResults = await this.offlineDB.getUnsyncedResults();
    const unsyncedCirculars = await this.offlineDB.getUnsyncedCirculars();
    const unsyncedProfiles = await this.offlineDB.getUnsyncedProfiles();

    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queueLength: syncQueue.length,
      unsyncedCounts: {
        attendance: unsyncedAttendance.length,
        timetables: unsyncedTimetables.length,
        results: unsyncedResults.length,
        circulars: unsyncedCirculars.length,
        profiles: unsyncedProfiles.length
      }
    };
  }

  async clearSyncQueue(): Promise<void> {
    await this.offlineDB.clearSyncQueue();
    console.log('SyncManager: Sync queue cleared');
  }

  // Cleanup old data and failed sync items
  async performMaintenance(): Promise<void> {
    console.log('SyncManager: Performing maintenance');
    await this.offlineDB.cleanup();
  }
}

// Singleton instance
let syncManagerInstance: BackgroundSyncManager | null = null;

export function getSyncManager(options?: SyncOptions): BackgroundSyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new BackgroundSyncManager(options);
  }
  return syncManagerInstance;
}

// Helper function to initialize sync manager in service worker context
export function initializeSyncManager(): BackgroundSyncManager {
  return new BackgroundSyncManager({
    maxRetries: 3,
    retryDelay: 2000,
    batchSize: 5,
    timeout: 15000
  });
}
