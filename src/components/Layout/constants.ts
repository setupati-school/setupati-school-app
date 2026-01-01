import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  ClipboardCheck,
  Settings,
  UserRoundPlus,
  Award,
  Newspaper
} from 'lucide-react';

export const TeacherNavigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard'
  },
  {
    id: 'students',
    label: 'Students',
    icon: GraduationCap,
    to: '/students'
  },
  {
    id: 'subjects',
    label: 'Subjects',
    icon: BookOpen,
    to: '/subjects'
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: ClipboardCheck,
    to: '/attendance'
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    to: 'timetable'
  },
  {
    id: 'circulars',
    label: 'Circulars',
    icon: FileText,
    to: '/circulars'
  },
  {
    id: 'event-blogs',
    label: 'Event Blogs',
    icon: Newspaper,
    to: '/event-blogs'
  },
  {
    id: 'results',
    label: 'Results',
    icon: Award,
    to: '/results'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    to: '/settings'
  }
];

export const StudentNavigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard'
  },
  {
    id: 'subjects',
    label: 'Subjects',
    icon: BookOpen,
    to: '/subjects'
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: ClipboardCheck,
    to: '/attendance'
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    to: 'timetable'
  },
  {
    id: 'circulars',
    label: 'Circulars',
    icon: FileText,
    to: '/circulars'
  },
  {
    id: 'results',
    label: 'Results',
    icon: Award,
    to: '/results'
  }
];

export const AdminNavigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard'
  },
  {
    id: 'students',
    label: 'Students',
    icon: GraduationCap,
    to: '/students'
  },
  {
    id: 'teachers',
    label: 'Teachers',
    icon: Users,
    to: '/teachers'
  },
  {
    id: 'subjects',
    label: 'Subjects',
    icon: BookOpen,
    to: '/subjects'
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: ClipboardCheck,
    to: '/attendance'
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    to: 'timetable'
  },
  {
    id: 'circulars',
    label: 'Circulars',
    icon: FileText,
    to: '/circulars'
  },
  {
    id: 'event-blogs',
    label: 'Event Blogs',
    icon: Newspaper,
    to: '/event-blogs'
  },
  {
    id: 'results',
    label: 'Results',
    icon: Award,
    to: '/results'
  },
  {
    id: 'account-creation',
    label: 'Account Creation',
    icon: UserRoundPlus,
    to: '/create'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    to: '/settings'
  }
];
