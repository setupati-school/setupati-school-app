// React Hook for Offline Functionality
// Setupati School Management System PWA

import { useState, useEffect, useCallback } from 'react';
import { getOfflineManager, type OfflineStatus } from '../lib/offline-manager';
import { type SyncResult } from '../lib/sync-manager';

export interface UseOfflineReturn {
  // Status
  isOnline: boolean;
  isOffline: boolean;
  hasOfflineData: boolean;
  syncInProgress: boolean;
  lastSyncTime: number | null;
  pendingSyncItems: number;

  // Actions
  forceSync: () => Promise<SyncResult>;
  clearOfflineData: () => Promise<void>;
  getOfflineDataSummary: () => Promise<any[]>;

  // Offline data operations
  saveAttendanceOffline: (attendance: any) => Promise<string>;
  getAttendanceOffline: (studentId?: string, date?: string) => Promise<any[]>;
  updateAttendanceOffline: (attendance: any) => Promise<void>;

  saveTimetableOffline: (timetable: any) => Promise<string>;
  getTimetableOffline: (classId?: string, day?: string) => Promise<any[]>;

  saveExamResultOffline: (result: any) => Promise<string>;
  getExamResultsOffline: (
    studentId?: string,
    examId?: string
  ) => Promise<any[]>;

  saveCircularOffline: (circular: any) => Promise<string>;
  getCircularsOffline: (priority?: 'low' | 'medium' | 'high') => Promise<any[]>;

  saveUserProfileOffline: (profile: any) => Promise<void>;
  getUserProfileOffline: (userId: string) => Promise<any>;
}

export function useOffline(): UseOfflineReturn {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    hasOfflineData: false,
    syncInProgress: false,
    lastSyncTime: null,
    pendingSyncItems: 0
  });

  const offlineManager = getOfflineManager();

  useEffect(() => {
    // Get initial status
    setStatus(offlineManager.getStatus());

    // Subscribe to status changes
    const unsubscribe = offlineManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, [offlineManager]);

  // Sync operations
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    return offlineManager.forceSync();
  }, [offlineManager]);

  const clearOfflineData = useCallback(async (): Promise<void> => {
    return offlineManager.clearOfflineData();
  }, [offlineManager]);

  const getOfflineDataSummary = useCallback(async () => {
    return offlineManager.getOfflineDataSummary();
  }, [offlineManager]);

  // Attendance operations
  const saveAttendanceOffline = useCallback(
    async (attendance: any): Promise<string> => {
      return offlineManager.saveAttendanceOffline(attendance);
    },
    [offlineManager]
  );

  const getAttendanceOffline = useCallback(
    async (studentId?: string, date?: string) => {
      return offlineManager.getAttendanceOffline(studentId, date);
    },
    [offlineManager]
  );

  const updateAttendanceOffline = useCallback(
    async (attendance: any): Promise<void> => {
      return offlineManager.updateAttendanceOffline(attendance);
    },
    [offlineManager]
  );

  // Timetable operations
  const saveTimetableOffline = useCallback(
    async (timetable: any): Promise<string> => {
      return offlineManager.saveTimetableOffline(timetable);
    },
    [offlineManager]
  );

  const getTimetableOffline = useCallback(
    async (classId?: string, day?: string) => {
      return offlineManager.getTimetableOffline(classId, day);
    },
    [offlineManager]
  );

  // Exam results operations
  const saveExamResultOffline = useCallback(
    async (result: any): Promise<string> => {
      return offlineManager.saveExamResultOffline(result);
    },
    [offlineManager]
  );

  const getExamResultsOffline = useCallback(
    async (studentId?: string, examId?: string) => {
      return offlineManager.getExamResultsOffline(studentId, examId);
    },
    [offlineManager]
  );

  // Circulars operations
  const saveCircularOffline = useCallback(
    async (circular: any): Promise<string> => {
      return offlineManager.saveCircularOffline(circular);
    },
    [offlineManager]
  );

  const getCircularsOffline = useCallback(
    async (priority?: 'low' | 'medium' | 'high') => {
      return offlineManager.getCircularsOffline(priority);
    },
    [offlineManager]
  );

  // User profile operations
  const saveUserProfileOffline = useCallback(
    async (profile: any): Promise<void> => {
      return offlineManager.saveUserProfileOffline(profile);
    },
    [offlineManager]
  );

  const getUserProfileOffline = useCallback(
    async (userId: string) => {
      return offlineManager.getUserProfileOffline(userId);
    },
    [offlineManager]
  );

  return {
    // Status
    isOnline: status.isOnline,
    isOffline: !status.isOnline,
    hasOfflineData: status.hasOfflineData,
    syncInProgress: status.syncInProgress,
    lastSyncTime: status.lastSyncTime,
    pendingSyncItems: status.pendingSyncItems,

    // Actions
    forceSync,
    clearOfflineData,
    getOfflineDataSummary,

    // Offline data operations
    saveAttendanceOffline,
    getAttendanceOffline,
    updateAttendanceOffline,

    saveTimetableOffline,
    getTimetableOffline,

    saveExamResultOffline,
    getExamResultsOffline,

    saveCircularOffline,
    getCircularsOffline,

    saveUserProfileOffline,
    getUserProfileOffline
  };
}

// Hook for simple online/offline status
export function useOnlineStatus(): { isOnline: boolean; isOffline: boolean } {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline
  };
}

// Hook for sync status only
export function useSyncStatus(): {
  syncInProgress: boolean;
  lastSyncTime: number | null;
  pendingSyncItems: number;
  forceSync: () => Promise<SyncResult>;
} {
  const { syncInProgress, lastSyncTime, pendingSyncItems, forceSync } =
    useOffline();

  return {
    syncInProgress,
    lastSyncTime,
    pendingSyncItems,
    forceSync
  };
}
