// Offline Manager - Main interface for offline functionality
// Setupati School Management System PWA

import {
  getOfflineDB,
  type AttendanceRecord,
  type TimetableRecord,
  type ExamResultRecord,
  type CircularRecord,
  type UserProfile
} from './offline-db';
import { getSyncManager, type SyncResult } from './sync-manager';

export interface OfflineStatus {
  isOnline: boolean;
  hasOfflineData: boolean;
  syncInProgress: boolean;
  lastSyncTime: number | null;
  pendingSyncItems: number;
}

export class OfflineManager {
  private offlineDB = getOfflineDB();
  private syncManager = getSyncManager();
  private listeners: Set<(status: OfflineStatus) => void> = new Set();
  private currentStatus: OfflineStatus = {
    isOnline: navigator.onLine,
    hasOfflineData: false,
    syncInProgress: false,
    lastSyncTime: null,
    pendingSyncItems: 0
  };

  constructor() {
    this.initializeOfflineManager();
  }

  private async initializeOfflineManager(): Promise<void> {
    // Set up event listeners
    window.addEventListener('online', () =>
      this.handleOnlineStatusChange(true)
    );
    window.addEventListener('offline', () =>
      this.handleOnlineStatusChange(false)
    );

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });
    }

    // Initial status update
    await this.updateStatus();

    // Periodic status updates
    setInterval(() => this.updateStatus(), 30000); // Every 30 seconds
  }

  private async handleOnlineStatusChange(isOnline: boolean): Promise<void> {
    this.currentStatus.isOnline = isOnline;

    if (isOnline) {
      console.log('OfflineManager: Device came online, triggering sync');
      await this.syncManager.triggerBackgroundSync();
    } else {
      console.log('OfflineManager: Device went offline');
    }

    await this.updateStatus();
    this.notifyListeners();
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;

    if (data.type === 'SYNC_COMPLETE') {
      console.log('OfflineManager: Sync completed', data.syncResult);
      this.currentStatus.lastSyncTime = data.timestamp;
      this.currentStatus.syncInProgress = false;
      this.updateStatus();
    } else if (data.type === 'SYNC_FAILED') {
      console.error('OfflineManager: Sync failed', data.error);
      this.currentStatus.syncInProgress = false;
      this.updateStatus();
    } else if (data.type === 'SPECIFIC_SYNC_COMPLETE') {
      console.log(
        `OfflineManager: ${data.dataType} sync completed`,
        data.syncResult
      );
      this.updateStatus();
    }
  }

  private async updateStatus(): Promise<void> {
    try {
      const syncStatus = await this.syncManager.getSyncStatus();
      const dbSize = await this.offlineDB.getDatabaseSize();

      this.currentStatus = {
        isOnline: navigator.onLine,
        hasOfflineData: dbSize.some((store) => store.count > 0),
        syncInProgress: syncStatus.syncInProgress,
        lastSyncTime: this.currentStatus.lastSyncTime,
        pendingSyncItems:
          syncStatus.queueLength +
          Object.values(syncStatus.unsyncedCounts).reduce(
            (sum, count) => sum + count,
            0
          )
      };

      this.notifyListeners();
    } catch (error) {
      console.error('OfflineManager: Failed to update status', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('OfflineManager: Listener error', error);
      }
    });
  }

  // Public API methods

  // Status and monitoring
  getStatus(): OfflineStatus {
    return { ...this.currentStatus };
  }

  onStatusChange(listener: (status: OfflineStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async forceSync(): Promise<SyncResult> {
    console.log('OfflineManager: Force sync requested');
    this.currentStatus.syncInProgress = true;
    this.notifyListeners();

    try {
      const result = await this.syncManager.forceSyncAll();
      this.currentStatus.lastSyncTime = Date.now();
      return result;
    } finally {
      this.currentStatus.syncInProgress = false;
      await this.updateStatus();
    }
  }

  // Attendance methods
  async saveAttendanceOffline(
    attendance: Omit<AttendanceRecord, 'id' | 'synced' | 'lastModified'>
  ): Promise<string> {
    const attendanceRecord: AttendanceRecord = {
      ...attendance,
      id: `offline_attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      synced: false,
      lastModified: Date.now()
    };

    await this.offlineDB.saveAttendance(attendanceRecord);

    // Queue for sync if online
    if (this.currentStatus.isOnline) {
      await this.syncManager.queueAction(
        'CREATE',
        '/api/attendance',
        attendanceRecord
      );
    }

    await this.updateStatus();
    return attendanceRecord.id;
  }

  async getAttendanceOffline(
    studentId?: string,
    date?: string
  ): Promise<AttendanceRecord[]> {
    if (studentId) {
      return this.offlineDB.getAttendanceByStudent(studentId);
    } else if (date) {
      return this.offlineDB.getAttendanceByDate(date);
    } else {
      return this.offlineDB.getAll<AttendanceRecord>('attendance');
    }
  }

  async updateAttendanceOffline(attendance: AttendanceRecord): Promise<void> {
    attendance.lastModified = Date.now();
    attendance.synced = false;

    await this.offlineDB.put('attendance', attendance);

    // Queue for sync if online
    if (this.currentStatus.isOnline) {
      await this.syncManager.queueAction(
        'UPDATE',
        `/api/attendance/${attendance.id}`,
        attendance
      );
    }

    await this.updateStatus();
  }

  // Timetable methods
  async saveTimetableOffline(
    timetable: Omit<TimetableRecord, 'id' | 'synced' | 'lastUpdated'>
  ): Promise<string> {
    const timetableRecord: TimetableRecord = {
      ...timetable,
      id: `offline_timetable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      synced: false,
      lastUpdated: Date.now()
    };

    await this.offlineDB.saveTimetable(timetableRecord);

    // Queue for sync if online
    if (this.currentStatus.isOnline) {
      await this.syncManager.queueAction(
        'CREATE',
        '/api/timetable',
        timetableRecord
      );
    }

    await this.updateStatus();
    return timetableRecord.id;
  }

  async getTimetableOffline(
    classId?: string,
    day?: string
  ): Promise<TimetableRecord[]> {
    if (classId) {
      return this.offlineDB.getTimetableByClass(classId);
    } else if (day) {
      return this.offlineDB.getTimetableByDay(day);
    } else {
      return this.offlineDB.getAll<TimetableRecord>('timetables');
    }
  }

  // Exam results methods
  async saveExamResultOffline(
    result: Omit<ExamResultRecord, 'id' | 'synced' | 'lastUpdated'>
  ): Promise<string> {
    const resultRecord: ExamResultRecord = {
      ...result,
      id: `offline_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      synced: false,
      lastUpdated: Date.now()
    };

    await this.offlineDB.saveExamResult(resultRecord);

    // Queue for sync if online
    if (this.currentStatus.isOnline) {
      await this.syncManager.queueAction(
        'CREATE',
        '/api/examresult',
        resultRecord
      );
    }

    await this.updateStatus();
    return resultRecord.id;
  }

  async getExamResultsOffline(
    studentId?: string,
    examId?: string
  ): Promise<ExamResultRecord[]> {
    if (studentId) {
      return this.offlineDB.getResultsByStudent(studentId);
    } else if (examId) {
      return this.offlineDB.getResultsByExam(examId);
    } else {
      return this.offlineDB.getAll<ExamResultRecord>('results');
    }
  }

  // Circulars methods
  async saveCircularOffline(
    circular: Omit<CircularRecord, 'id' | 'synced' | 'lastUpdated'>
  ): Promise<string> {
    const circularRecord: CircularRecord = {
      ...circular,
      id: `offline_circular_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      synced: false,
      lastUpdated: Date.now()
    };

    await this.offlineDB.saveCircular(circularRecord);

    // Queue for sync if online
    if (this.currentStatus.isOnline) {
      await this.syncManager.queueAction(
        'CREATE',
        '/api/circular',
        circularRecord
      );
    }

    await this.updateStatus();
    return circularRecord.id;
  }

  async getCircularsOffline(
    priority?: 'low' | 'medium' | 'high'
  ): Promise<CircularRecord[]> {
    if (priority) {
      return this.offlineDB.getCircularsByPriority(priority);
    } else {
      return this.offlineDB.getAll<CircularRecord>('circulars');
    }
  }

  // User profile methods
  async saveUserProfileOffline(
    profile: Omit<UserProfile, 'synced' | 'lastUpdated'>
  ): Promise<void> {
    const profileRecord: UserProfile = {
      ...profile,
      synced: false,
      lastUpdated: Date.now()
    };

    await this.offlineDB.saveUserProfile(profileRecord);

    // Queue for sync if online
    if (this.currentStatus.isOnline) {
      await this.syncManager.queueAction(
        'UPDATE',
        `/api/user/${profile.id}`,
        profileRecord
      );
    }

    await this.updateStatus();
  }

  async getUserProfileOffline(
    userId: string
  ): Promise<UserProfile | undefined> {
    return this.offlineDB.getUserProfile(userId);
  }

  // Cache management
  async clearOfflineData(): Promise<void> {
    const stores = [
      'attendance',
      'timetables',
      'results',
      'circulars',
      'userProfile'
    ];

    for (const store of stores) {
      await this.offlineDB.clear(store);
    }

    await this.syncManager.clearSyncQueue();
    await this.updateStatus();

    console.log('OfflineManager: All offline data cleared');
  }

  async getOfflineDataSummary(): Promise<
    {
      storeName: string;
      count: number;
      unsyncedCount: number;
    }[]
  > {
    const dbSize = await this.offlineDB.getDatabaseSize();
    const syncStatus = await this.syncManager.getSyncStatus();

    return dbSize.map((store) => ({
      storeName: store.storeName,
      count: store.count,
      unsyncedCount:
        syncStatus.unsyncedCounts[
          store.storeName as keyof typeof syncStatus.unsyncedCounts
        ] || 0
    }));
  }

  // Maintenance
  async performMaintenance(): Promise<void> {
    console.log('OfflineManager: Performing maintenance');
    await this.syncManager.performMaintenance();
    await this.updateStatus();
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.listeners.clear();
    await this.offlineDB.close();
  }
}

// Singleton instance
let offlineManagerInstance: OfflineManager | null = null;

export function getOfflineManager(): OfflineManager {
  if (!offlineManagerInstance) {
    offlineManagerInstance = new OfflineManager();
  }
  return offlineManagerInstance;
}

// Helper function to check if app is running offline
export function isOffline(): boolean {
  return !navigator.onLine;
}

// Helper function to wait for online status
export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
}
