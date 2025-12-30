// IndexedDB Management for Offline Data Storage
// Setupati School Management System PWA

export interface OfflineDatabase {
  attendance: AttendanceRecord[];
  timetables: TimetableRecord[];
  results: ExamResultRecord[];
  circulars: CircularRecord[];
  userProfile: UserProfile;
  syncQueue: SyncQueueItem[];
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subject: string;
  synced: number; // 0 = false, 1 = true (for IndexedDB compatibility)
  lastModified: number;
}

export interface TimetableRecord {
  id: string;
  classId: string;
  day: string;
  periods: TimetablePeriod[];
  lastUpdated: number;
  synced: number; // 0 = false, 1 = true (for IndexedDB compatibility)
}

export interface TimetablePeriod {
  id: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface ExamResultRecord {
  id: string;
  studentId: string;
  examId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
  lastUpdated: number;
  synced: number; // 0 = false, 1 = true (for IndexedDB compatibility)
}

export interface CircularRecord {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: string[];
  attachments?: string[];
  lastUpdated: number;
  synced: number; // 0 = false, 1 = true (for IndexedDB compatibility)
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  classId?: string;
  studentIds?: string[]; // For parents
  lastUpdated: number;
  synced: number; // 0 = false, 1 = true (for IndexedDB compatibility)
}

// IndexedDB Configuration
const DB_NAME = 'setupati-school-offline';
const DB_VERSION = 2; // Incremented to update schema for synced field type change

export class OfflineDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('OfflineDB: Failed to open database', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('OfflineDB: Database opened successfully');
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('OfflineDB: Upgrading database schema');

        // Create object stores
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase) {
    // Attendance store
    if (!db.objectStoreNames.contains('attendance')) {
      const attendanceStore = db.createObjectStore('attendance', {
        keyPath: 'id'
      });
      attendanceStore.createIndex('studentId', 'studentId', { unique: false });
      attendanceStore.createIndex('date', 'date', { unique: false });
      attendanceStore.createIndex('synced', 'synced', { unique: false });
    }

    // Timetables store
    if (!db.objectStoreNames.contains('timetables')) {
      const timetableStore = db.createObjectStore('timetables', {
        keyPath: 'id'
      });
      timetableStore.createIndex('classId', 'classId', { unique: false });
      timetableStore.createIndex('day', 'day', { unique: false });
      timetableStore.createIndex('synced', 'synced', { unique: false });
    }

    // Exam results store
    if (!db.objectStoreNames.contains('results')) {
      const resultsStore = db.createObjectStore('results', { keyPath: 'id' });
      resultsStore.createIndex('studentId', 'studentId', { unique: false });
      resultsStore.createIndex('examId', 'examId', { unique: false });
      resultsStore.createIndex('synced', 'synced', { unique: false });
    }

    // Circulars store
    if (!db.objectStoreNames.contains('circulars')) {
      const circularsStore = db.createObjectStore('circulars', {
        keyPath: 'id'
      });
      circularsStore.createIndex('date', 'date', { unique: false });
      circularsStore.createIndex('priority', 'priority', { unique: false });
      circularsStore.createIndex('synced', 'synced', { unique: false });
    }

    // User profile store
    if (!db.objectStoreNames.contains('userProfile')) {
      const profileStore = db.createObjectStore('userProfile', {
        keyPath: 'id'
      });
      profileStore.createIndex('role', 'role', { unique: false });
      profileStore.createIndex('synced', 'synced', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains('syncQueue')) {
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncStore.createIndex('action', 'action', { unique: false });
      syncStore.createIndex('endpoint', 'endpoint', { unique: false });
      syncStore.createIndex('retryCount', 'retryCount', { unique: false });
    }
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;
    return this.initDB();
  }

  // Generic CRUD operations
  async add<T>(storeName: string, data: T): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      try {
        // Check if the index exists
        if (!store.indexNames.contains(indexName)) {
          console.warn(
            `OfflineDB: Index '${indexName}' does not exist in store '${storeName}'`
          );
          resolve([]);
          return;
        }

        const index = store.index(indexName);

        // Validate the value parameter
        if (value === undefined || value === null) {
          console.warn(
            `OfflineDB: Invalid key value for index '${indexName}': ${value}`
          );
          resolve([]);
          return;
        }

        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.error(
            `OfflineDB: Error querying index '${indexName}' with value '${value}':`,
            request.error
          );
          reject(request.error);
        };
      } catch (error) {
        console.error(
          `OfflineDB: Exception in getByIndex for '${storeName}.${indexName}':`,
          error
        );
        resolve([]);
      }
    });
  }

  // Attendance-specific methods
  async saveAttendance(attendance: AttendanceRecord): Promise<void> {
    attendance.lastModified = Date.now();
    attendance.synced = 0; // 0 = false for IndexedDB compatibility
    await this.put('attendance', attendance);
  }

  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    return this.getByIndex<AttendanceRecord>(
      'attendance',
      'studentId',
      studentId
    );
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    return this.getByIndex<AttendanceRecord>('attendance', 'date', date);
  }

  async getUnsyncedAttendance(): Promise<AttendanceRecord[]> {
    return this.getByIndex<AttendanceRecord>('attendance', 'synced', 0);
  }

  // Timetable-specific methods
  async saveTimetable(timetable: TimetableRecord): Promise<void> {
    timetable.lastUpdated = Date.now();
    timetable.synced = 0; // 0 = false for IndexedDB compatibility
    await this.put('timetables', timetable);
  }

  async getTimetableByClass(classId: string): Promise<TimetableRecord[]> {
    return this.getByIndex<TimetableRecord>('timetables', 'classId', classId);
  }

  async getTimetableByDay(day: string): Promise<TimetableRecord[]> {
    return this.getByIndex<TimetableRecord>('timetables', 'day', day);
  }

  async getUnsyncedTimetables(): Promise<TimetableRecord[]> {
    return this.getByIndex<TimetableRecord>('timetables', 'synced', 0);
  }

  // Exam results-specific methods
  async saveExamResult(result: ExamResultRecord): Promise<void> {
    result.lastUpdated = Date.now();
    result.synced = 0; // 0 = false for IndexedDB compatibility
    await this.put('results', result);
  }

  async getResultsByStudent(studentId: string): Promise<ExamResultRecord[]> {
    return this.getByIndex<ExamResultRecord>('results', 'studentId', studentId);
  }

  async getResultsByExam(examId: string): Promise<ExamResultRecord[]> {
    return this.getByIndex<ExamResultRecord>('results', 'examId', examId);
  }

  async getUnsyncedResults(): Promise<ExamResultRecord[]> {
    return this.getByIndex<ExamResultRecord>('results', 'synced', 0);
  }

  // Circulars-specific methods
  async saveCircular(circular: CircularRecord): Promise<void> {
    circular.lastUpdated = Date.now();
    circular.synced = 0; // 0 = false for IndexedDB compatibility
    await this.put('circulars', circular);
  }

  async getCircularsByPriority(
    priority: 'low' | 'medium' | 'high'
  ): Promise<CircularRecord[]> {
    return this.getByIndex<CircularRecord>('circulars', 'priority', priority);
  }

  async getUnsyncedCirculars(): Promise<CircularRecord[]> {
    return this.getByIndex<CircularRecord>('circulars', 'synced', 0);
  }

  // User profile methods
  async saveUserProfile(profile: UserProfile): Promise<void> {
    profile.lastUpdated = Date.now();
    profile.synced = 0; // 0 = false for IndexedDB compatibility
    await this.put('userProfile', profile);
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.get<UserProfile>('userProfile', userId);
  }

  async getUnsyncedProfiles(): Promise<UserProfile[]> {
    return this.getByIndex<UserProfile>('userProfile', 'synced', 0);
  }

  // Sync queue methods
  async addToSyncQueue(
    item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<string> {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: item.maxRetries || 3
    };

    await this.add('syncQueue', syncItem);
    return syncItem.id;
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const items = await this.getAll<SyncQueueItem>('syncQueue');
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }

  async updateSyncItem(
    id: string,
    updates: Partial<SyncQueueItem>
  ): Promise<void> {
    const item = await this.get<SyncQueueItem>('syncQueue', id);
    if (item) {
      const updatedItem = { ...item, ...updates };
      await this.put('syncQueue', updatedItem);
    }
  }

  async removeSyncItem(id: string): Promise<void> {
    await this.delete('syncQueue', id);
  }

  async clearSyncQueue(): Promise<void> {
    await this.clear('syncQueue');
  }

  // Mark items as synced
  async markAsSynced(storeName: string, id: string): Promise<void> {
    const item = await this.get(storeName, id);
    if (item && typeof item === 'object') {
      (item as any).synced = 1; // 1 = true for IndexedDB compatibility
      await this.put(storeName, item);
    }
  }

  // Bulk operations for efficiency
  async bulkSave<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const promises = items.map((item) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }

  async bulkMarkAsSynced(storeName: string, ids: string[]): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const promises = ids.map(async (id) => {
      return new Promise<void>((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const item = getRequest.result;
          if (item) {
            item.synced = 1; // 1 = true for IndexedDB compatibility
            const putRequest = store.put(item);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    });

    await Promise.all(promises);
  }

  // Database maintenance
  async getDatabaseSize(): Promise<{ storeName: string; count: number }[]> {
    const db = await this.getDB();
    const storeNames = Array.from(db.objectStoreNames);

    const sizes = await Promise.all(
      storeNames.map(async (storeName) => {
        const items = await this.getAll(storeName);
        return { storeName, count: items.length };
      })
    );

    return sizes;
  }

  async cleanup(): Promise<void> {
    // Clean up old sync queue items (older than 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const syncItems = await this.getSyncQueue();

    const oldItems = syncItems.filter(
      (item) => item.timestamp < weekAgo && item.retryCount >= item.maxRetries
    );

    for (const item of oldItems) {
      await this.removeSyncItem(item.id);
    }

    console.log(`OfflineDB: Cleaned up ${oldItems.length} old sync items`);
  }

  // Close database connection
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

// Singleton instance
let offlineDBInstance: OfflineDBManager | null = null;

export function getOfflineDB(): OfflineDBManager {
  if (!offlineDBInstance) {
    offlineDBInstance = new OfflineDBManager();
  }
  return offlineDBInstance;
}
