import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAuth } from 'firebase/auth';
import { DayOfWeek } from '@/types/schoolStoreType';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const formatDate = (iso: string | undefined) => {
  try {
    let d;
    if (iso !== undefined) {
      d = new Date(iso);
      return d.toLocaleDateString();
    }
  } catch {
    return iso;
  }
};

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const EXAM_TYPES = ['Unit Test', 'Quarterly', 'Half-Yearly', 'Annual'] as const;

export  const PERIODS = [
  { period: 1, startTime: '9:00 AM', endTime: '9:45 AM' },
  { period: 2, startTime: '9:45 AM', endTime: '10:30 AM' },
  { period: 3, startTime: '10:30 AM', endTime: '11:15 AM' },
  { period: 4, startTime: '11:15 AM', endTime: '12:00 PM' },
  { period: 5, startTime: '12:45 PM', endTime: '1:30 PM' },
  { period: 6, startTime: '1:30 PM', endTime: '2:15 PM' },
  { period: 7, startTime: '2:15 PM', endTime: '3:00 PM' },
  { period: 8, startTime: '3:00 PM', endTime: '3:45 PM' }
];

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Firebase Auth not initialized');
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn('No user currently authenticated');
      return null;
    }

    const token = await user.getIdToken();
    if (!token) {
      console.warn('Failed to generate ID token');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};


export const getTargetGroupColor = (group: string) => {
  switch (group.toLowerCase()) {
    case 'all':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'students':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'teachers':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'parents':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const isExpired = (validUntil: string): boolean => {
  return new Date(validUntil) < new Date();
};

export const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};
