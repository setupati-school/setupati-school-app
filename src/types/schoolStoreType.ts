export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  f_name: string;
  l_name: string;
  email: string;
  roll_no: string;
  grade_id: string;
  section_id: string;
  parent_id: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone_num: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  blood_group: string;
  aadhar_no: string;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  f_name: string;
  l_name: string;
  email: string;
  designation: string;
  dob: string;
  doj: string;
  experienced_years: number;
  gender: 'Male' | 'Female' | 'Other';
  qualification: string;
  phone_num: string;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: string;
  f_name: string;
  l_name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  occupation: string;
  relation: 'Father' | 'Mother' | 'Guardian';
  phone_num: string;
  student_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  grade_name: string;
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

export interface Subject {
  id: string;
  subject_name: string;
  grade_id: string;
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
  issued_date: string;
  valid_until: string;
  targeted_group: 'All' | 'Students' | 'Teachers' | 'Parents';
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type EventCategory =
  | 'Sports'
  | 'Academic'
  | 'Cultural'
  | 'Ceremony'
  | 'Community'
  | 'Other';

export interface EventBlog {
  id: string;
  title: string;
  content: string;
  category: EventCategory;
  event_date: string;
  author_name: string;
  author_id: string;
  images: string[];
  is_published: boolean;
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
  id: string;
  day_of_week: DayOfWeek;
  period: number;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export type ExamType = 'Unit Test' | 'Quarterly' | 'Half-Yearly' | 'Annual';

export interface ExamTimetable {
  id: string;
  grade_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  exam_type: ExamType;
  created_at: string;
  updated_at: string;
}

export interface SubjectMark {
  subject_id: string;
  marks: number;
}

export interface ExamResult {
  id: string;
  student_id: string;
  exam_id: string;
  subjects: SubjectMark[];
  total: number;
  pass_or_fail: 'pass' | 'fail';
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
  created_at: string;
  updated_at: string;
}

// Store interface
export interface SchoolStore {
  currentUser: User | null;

  teachers: Teacher[];
  students: Student[];
  subjects: Subject[];
  sections: Section[];
  grades: Grade[];
  attendance: Attendance[];
  circulars: Circular[];
  homework: Homework[];
  timetables: Timetable[];
  examTimetables: ExamTimetable[];
  exams: any[];

  activeView: string;
  sidebarCollapsed: boolean;
  loading: boolean;
  currentLanguage: string;

  setCurrentUser: (user: User | null) => void;
  setActiveView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentLanguage: (code: string) => void;

  setTeachers: (teachers: Teacher[]) => void;
  setStudents: (students: Student[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  setSections: (sections: Section[]) => void;
  setGrades: (grades: Grade[]) => void;
  setAttendance: (attendance: Attendance[]) => void;
  setCirculars: (circulars: Circular[]) => void;
  setHomework: (homework: Homework[]) => void;
  setTimetables: (timetables: Timetable[]) => void;
  setExamTimetables: (examTimetables: ExamTimetable[]) => void;
  setExams: (exams: any[]) => void;

  fetchExamsFromBackend: (studentId?: string) => Promise<any[]>;
  getMyResults: () => any[];
  getSubjectById: (id?: string) => Subject | null;
  getExamById: (id?: string) => any | null;
  addAttendance?: (record: Attendance) => void;
  updateAttendance?: (id: string, patch: Partial<Attendance>) => void;

  getStudentCount: () => number;
  getTeacherCount: () => number;
  getPresentStudentsToday: () => number;
  getRecentCirculars: () => Circular[];

  getMyStudent: () => Student | null;
  getMyAttendance: () => Attendance[];
  getMyTimetable: () => Timetable[];
  getMySubjects: () => Subject[];
  getMySection: () => Section | null;
  getMyGrade: () => Grade | null;

  initCurrentUser: () => void;
  resetStore: () => void;
}
