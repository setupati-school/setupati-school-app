// Offline API Interceptor
// Automatically caches API responses to IndexedDB for offline access

import { AxiosResponse, AxiosRequestConfig } from 'axios';
import {
  getOfflineDB,
  type AttendanceRecord,
  type TimetableRecord,
  type ExamResultRecord,
  type CircularRecord
} from './offline-db';

export class OfflineAPIInterceptor {
  private offlineDB = getOfflineDB();

  // Map API endpoints to IndexedDB store names and transformation functions
  private endpointMappings = {
    '/attendance': {
      storeName: 'attendance',
      transform: this.transformAttendanceData.bind(this)
    },
    '/timetable': {
      storeName: 'timetables',
      transform: this.transformTimetableData.bind(this)
    },
    '/examresult': {
      storeName: 'results',
      transform: this.transformExamResultData.bind(this)
    },
    '/circular': {
      storeName: 'circulars',
      transform: this.transformCircularData.bind(this)
    }
  };

  // Response interceptor to cache API responses
  async handleResponse(response: AxiosResponse): Promise<AxiosResponse> {
    try {
      // Only cache GET requests with successful responses
      if (
        response.config.method?.toLowerCase() === 'get' &&
        response.status === 200
      ) {
        await this.cacheResponseData(response);
      }
    } catch (error) {
      console.warn('OfflineAPIInterceptor: Failed to cache response', error);
      // Don't throw - just log the warning and continue
    }

    return response;
  }

  private async cacheResponseData(response: AxiosResponse): Promise<void> {
    const url = response.config.url || '';

    // Find matching endpoint mapping
    const mapping = Object.entries(this.endpointMappings).find(([endpoint]) =>
      url.includes(endpoint)
    );

    if (!mapping) {
      return; // No mapping found, skip caching
    }

    const [, { storeName, transform }] = mapping;
    const data = response.data;

    if (!data) {
      return;
    }

    console.log(`OfflineAPIInterceptor: Caching ${storeName} data from ${url}`);
    console.log(`OfflineAPIInterceptor: Raw response data:`, data);

    try {
      // Transform and cache the data
      const transformedData = await transform(data, url);
      console.log(`OfflineAPIInterceptor: Transformed data:`, transformedData);

      if (Array.isArray(transformedData)) {
        // Bulk save for arrays
        await this.offlineDB.bulkSave(storeName, transformedData);
        console.log(
          `OfflineAPIInterceptor: Cached ${transformedData.length} ${storeName} records`
        );
      } else if (transformedData) {
        // Single item save
        await this.offlineDB.put(storeName, transformedData);
        console.log(`OfflineAPIInterceptor: Cached single ${storeName} record`);
      }
    } catch (error) {
      console.error(
        `OfflineAPIInterceptor: Failed to cache ${storeName} data`,
        error
      );
    }
  }

  // Transform attendance data to IndexedDB format
  private async transformAttendanceData(
    data: any,
    url: string
  ): Promise<AttendanceRecord[]> {
    const records: AttendanceRecord[] = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        const record = this.normalizeAttendanceRecord(item);
        if (record) {
          records.push(record);
        }
      }
    } else if (data && typeof data === 'object') {
      const record = this.normalizeAttendanceRecord(data);
      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  private normalizeAttendanceRecord(item: any): AttendanceRecord | null {
    try {
      // Handle nested structure (item.attendance or direct item)
      const attendance = item.attendance || item;

      if (!attendance.id) {
        return null;
      }

      return {
        id: attendance.id,
        studentId: attendance.studentId || attendance.student_id || '',
        date: attendance.date || new Date().toISOString().split('T')[0],
        status: attendance.status || 'present',
        subject: attendance.subject || '',
        synced: 1, // Mark as synced since it came from server
        lastModified: Date.now()
      };
    } catch (error) {
      console.warn(
        'OfflineAPIInterceptor: Failed to normalize attendance record',
        error
      );
      return null;
    }
  }

  // Transform timetable data to IndexedDB format
  private async transformTimetableData(
    data: any,
    url: string
  ): Promise<TimetableRecord[]> {
    const records: TimetableRecord[] = [];

    // Handle API response format: { timetables: [...] }
    let timetablesArray = data;
    if (data && typeof data === 'object' && data.timetables) {
      timetablesArray = data.timetables;
    }

    if (Array.isArray(timetablesArray)) {
      for (const item of timetablesArray) {
        const record = this.normalizeTimetableRecord(item);
        if (record) {
          records.push(record);
        }
      }
    } else if (timetablesArray && typeof timetablesArray === 'object') {
      const record = this.normalizeTimetableRecord(timetablesArray);
      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  private normalizeTimetableRecord(item: any): TimetableRecord | null {
    try {
      // Handle both nested structure (item.timeTable) and direct structure
      const timetable = item.timeTable || item.timetable || item;

      if (!timetable.id && !item.id) {
        return null;
      }

      return {
        id: item.id || timetable.id,
        classId: timetable.classId || timetable.class_id || '',
        day: timetable.day || '',
        periods: timetable.periods || [],
        lastUpdated: Date.now(),
        synced: 1 // Mark as synced since it came from server
      };
    } catch (error) {
      console.warn(
        'OfflineAPIInterceptor: Failed to normalize timetable record',
        error
      );
      return null;
    }
  }

  // Transform exam result data to IndexedDB format
  private async transformExamResultData(
    data: any,
    url: string
  ): Promise<ExamResultRecord[]> {
    const records: ExamResultRecord[] = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        const record = this.normalizeExamResultRecord(item);
        if (record) {
          records.push(record);
        }
      }
    } else if (data && typeof data === 'object') {
      const record = this.normalizeExamResultRecord(data);
      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  private normalizeExamResultRecord(item: any): ExamResultRecord | null {
    try {
      const result = item.result || item;

      if (!result.id) {
        return null;
      }

      return {
        id: result.id,
        studentId: result.studentId || result.student_id || '',
        examId: result.examId || result.exam_id || '',
        subject: result.subject || '',
        marks: result.marks || 0,
        maxMarks: result.maxMarks || result.max_marks || 100,
        grade: result.grade || '',
        lastUpdated: Date.now(),
        synced: 1 // Mark as synced since it came from server
      };
    } catch (error) {
      console.warn(
        'OfflineAPIInterceptor: Failed to normalize exam result record',
        error
      );
      return null;
    }
  }

  // Transform circular data to IndexedDB format
  private async transformCircularData(
    data: any,
    url: string
  ): Promise<CircularRecord[]> {
    const records: CircularRecord[] = [];

    // Handle API response format: { circulars: [...] }
    let circularsArray = data;
    if (data && typeof data === 'object' && data.circulars) {
      circularsArray = data.circulars;
    }

    if (Array.isArray(circularsArray)) {
      for (const item of circularsArray) {
        const record = this.normalizeCircularRecord(item);
        if (record) {
          records.push(record);
        }
      }
    } else if (circularsArray && typeof circularsArray === 'object') {
      const record = this.normalizeCircularRecord(circularsArray);
      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  private normalizeCircularRecord(item: any): CircularRecord | null {
    try {
      // Handle both nested structure (item.circular) and direct structure
      const circular = item.circular || item;

      if (!circular.id) {
        return null;
      }

      return {
        id: circular.id,
        title: circular.title || '',
        content: circular.content || '',
        date:
          circular.date ||
          circular.issued_date ||
          new Date().toISOString().split('T')[0],
        priority: circular.priority || 'medium',
        targetAudience:
          circular.targetAudience || circular.target_audience || [],
        attachments: circular.attachments || [],
        lastUpdated: Date.now(),
        synced: 1 // Mark as synced since it came from server
      };
    } catch (error) {
      console.warn(
        'OfflineAPIInterceptor: Failed to normalize circular record',
        error
      );
      return null;
    }
  }

  // Get cached data when offline
  async getCachedData(endpoint: string): Promise<any[]> {
    const mapping = Object.entries(this.endpointMappings).find(([ep]) =>
      endpoint.includes(ep)
    );

    if (!mapping) {
      return [];
    }

    const [, { storeName }] = mapping;

    try {
      return await this.offlineDB.getAll(storeName);
    } catch (error) {
      console.error(
        `OfflineAPIInterceptor: Failed to get cached ${storeName} data`,
        error
      );
      return [];
    }
  }

  // Clear cached data for a specific endpoint
  async clearCachedData(endpoint: string): Promise<void> {
    const mapping = Object.entries(this.endpointMappings).find(([ep]) =>
      endpoint.includes(ep)
    );

    if (!mapping) {
      return;
    }

    const [, { storeName }] = mapping;

    try {
      await this.offlineDB.clear(storeName);
      console.log(`OfflineAPIInterceptor: Cleared cached ${storeName} data`);
    } catch (error) {
      console.error(
        `OfflineAPIInterceptor: Failed to clear cached ${storeName} data`,
        error
      );
    }
  }
}

// Singleton instance
let interceptorInstance: OfflineAPIInterceptor | null = null;

export function getOfflineAPIInterceptor(): OfflineAPIInterceptor {
  if (!interceptorInstance) {
    interceptorInstance = new OfflineAPIInterceptor();
  }
  return interceptorInstance;
}
