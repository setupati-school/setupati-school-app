export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  subject_ids: string[];
  section_ids: string[];
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  designation: string;
  qualification: string;
  doj: string;
  experienced_years: number;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  section_id: string;
  subject_ids: string[];
  roll_no: string;
  dob: string;
  f_name: string;
  l_name: string;
  gender: string;
  blood_group: string;
  aadhar_no: string;
  phone_num1: string;
  phone_num2?: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  subject_id?: string;
  subject_name: string;
  grade_id: string;
  teacher_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  section_name: string;
  grade_id: string;
  class_teacher_id: string;
  group_name: string;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  grade_id?: string;
  grade_name: string;
  section_ids: string[];
  subject_ids: string[];
  subject_name: string[];
  ahm_staff_id: string;
  teacher_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  section_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  updated_at: string;
}

export interface Circular {
  id: string;
  title: string;
  description: string;
  issued_by: string;
  targeted_group: string;
  issued_date: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

export interface Homework {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  description: string;
  due_date: string;
  created_date: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export interface Timetable {
  id?: string;
  timetable_id?: string;
  day_of_week: DayOfWeek;
  period: number;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

// API response wrapper for timetable
export interface TimetableResponse {
  id: string;
  timeTable: Timetable;
}

// Store interface
export interface SchoolStore {
  // Current user
  currentUser: User | null;

  // Data
  teachers: Teacher[];
  students: Student[];
  subjects: Subject[];
  sections: Section[];
  grades: Grade[];
  attendance: Attendance[];
  circulars: Circular[];
  homework: Homework[];
  timetables: Timetable[];

  // UI State
  activeView: string;
  sidebarCollapsed: boolean;
  loading: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setActiveView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Data actions
  setTeachers: (teachers: Teacher[]) => void;
  setStudents: (students: Student[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  setSections: (sections: Section[]) => void;
  setGrades: (grades: Grade[]) => void;
  setAttendance: (attendance: Attendance[]) => void;
  setCirculars: (circulars: Circular[]) => void;
  setHomework: (homework: Homework[]) => void;
  setTimetables: (timetables: Timetable[]) => void;

  // Statistics
  getStudentCount: () => number;
  getTeacherCount: () => number;
  getPresentStudentsToday: () => number;
  getRecentCirculars: () => Circular[];

  initCurrentUser: () => void;
}
