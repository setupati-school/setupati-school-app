import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAuth, signOut } from 'firebase/auth';
import { DayOfWeek } from '@/types/schoolStoreType';
import type { SubjectMark } from '@/types/type';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PASS_THRESHOLD = 35;

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
      await signOut(auth);
      console.warn('User logged out due to token generation failure');
      return null;
    }

    return token;
  } catch (error) {
    
    console.error('Error getting auth token:', error);
    try {
      const auth = getAuth();
      await signOut(auth);
      console.warn('User logged out due to token error');
    } catch (logoutError) {
      console.error('Error logging out user:', logoutError);
    }
    
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

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getInitials = (name?: string | null): string => {
  if (!name) return 'ST';
  return (
    name
      ?.split(' ')
      ?.map((n) => n?.[0] ?? '')
      ?.join('')
      ?.toUpperCase()
      ?.slice(0, 2) || 'ST'
  );
};

export const getFirstName = (
  name?: string | null,
  fallback = 'Student'
): string => {
  return name?.split(' ')?.[0] ?? fallback;
};

// Returns the current school day ("Monday"–"Saturday") or null for Sunday.
export const getCurrentSchoolDay = (): DayOfWeek | null => {
  const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday ...
  if (dayIndex === 0) return null;
  // DAYS_OF_WEEK starts from Monday at index 0
  return DAYS_OF_WEEK[dayIndex - 1] ?? null;
};

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export const getAttendanceStatusBadge = (
  rate: number
): { label: string; variant: BadgeVariant } => {
  if (rate >= 90) return { label: 'Excellent', variant: 'default' };
  if (rate >= 75) return { label: 'Good', variant: 'secondary' };
  if (rate >= 60) return { label: 'Average', variant: 'outline' };
  return { label: 'Low', variant: 'destructive' };
};

export const getGradeForPercentage = (
  pct: number
): { grade: string; variant: BadgeVariant } => {
  if (pct >= 90) return { grade: 'A+', variant: 'default' };
  if (pct >= 80) return { grade: 'A', variant: 'default' };
  if (pct >= 70) return { grade: 'B', variant: 'secondary' };
  if (pct >= 60) return { grade: 'C', variant: 'secondary' };
  if (pct >= 50) return { grade: 'D', variant: 'outline' };
  return { grade: 'F', variant: 'destructive' };
};

export const calculateExamTotals = (
  subjects?: SubjectMark[]
): { totalMarks: number; totalMax: number; pct: number } => {
  if (!subjects || !Array.isArray(subjects)) {
    return { totalMarks: 0, totalMax: 0, pct: 0 };
  }
  const totalMarks =
    subjects?.reduce((s, x) => s + (Number(x?.marks) || 0), 0) ?? 0;
  const totalMax =
    subjects?.reduce((s, x) => s + (Number(x?.maxMarks ?? 100) || 100), 0) ?? 0;
  const pct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
  return { totalMarks, totalMax, pct };
};

export const calculateAttendanceStats = (
  records?: { status?: string }[]
): { total: number; present: number; absent: number; late: number; rate: number } => {
  const total = records?.length ?? 0;
  const present = records?.filter((r) => r?.status === 'present')?.length ?? 0;
  const absent = records?.filter((r) => r?.status === 'absent')?.length ?? 0;
  const late = records?.filter((r) => r?.status === 'late')?.length ?? 0;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, late, rate };
};

export const attendanceRate =(studentCount: number, presentToday: number): number=> {
return   studentCount > 0 ? Math.round((presentToday / studentCount) * 100) : 0;
};

export const getSection = (sectionId: string, sections?: any[]) => {
    return sections?.find((s) => s?.id === sectionId);
};

export const getGrade = (sectionId: string, grades?: any[], sections?: any[]) => {
  const section = getSection(sectionId,sections);
  if (!section) return null;
  return grades?.find((g) => g?.id === section.grade_id);
};

export const getInitial = (firstName: string, lastName: string) => {
    const first = firstName?.[0] ?? '';
    const last = lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'S';
  };



  

