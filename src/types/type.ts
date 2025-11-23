import type { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'leave';

export type AttendanceRecord = {
  date: string; // ISO string or yyyy-mm-dd
  status: AttendanceStatus;
  note?: string;
  id: string;
};

export type SubjectMark = {
  subject: string;
  marks: number;
  maxMarks?: number;
  remark?: string;
};

export type ExamResult = {
  id?: string;
  title: string;
  date?: string;
  subjects: SubjectMark[];
  note?: string;
};

export type Period = {
  id?: string;
  time?: string; // e.g. "09:00 - 10:00"
  subject: string;
  teacher?: string;
  room?: string;
};

export type DayTimetable = {
  day: string; // "Monday", "Tuesday", ...
  date?: string;
  periods: Period[];
};
