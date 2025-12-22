import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { SchoolStore, User } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/axiosConfig';
import { toast } from '@/hooks/use-toast';

/**
 * School store: keep only grouped exam results (server-side grouped)
 * Components will consume getMyResults() which returns grouped exams.
 */

export const useSchoolStore = create<SchoolStore>()(
  devtools(
    persist(
      (set, get) => ({
        // state
        currentUser: null,
        teachers: [],
        students: [],
        subjects: [],
        sections: [],
        grades: [],
        attendance: [],
        circulars: [],
        homework: [],
        timetables: [],
        examTimetables: [],
        exams: [], // grouped exam results from backend
        activeView: 'dashboard',
        sidebarCollapsed: false,
        loading: false,
        currentLanguage: 'en',

        // basic setters
        setCurrentUser: (user) => set({ currentUser: user }),
        setActiveView: (view) => set({ activeView: view }),
        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }),
        setLoading: (loading) => set({ loading }),

        setTeachers: (teachers) => set({ teachers }),
        setStudents: (students) => set({ students }),
        setSubjects: (subjects) => set({ subjects }),
        setSections: (sections) => set({ sections }),
        setGrades: (grades) => set({ grades }),
        setAttendance: (attendance) => set({ attendance }),
        setCirculars: (circulars) => set({ circulars }),
        setHomework: (homework) => set({ homework }),
        setTimetables: (timetables) => set({ timetables }),
        setExamTimetables: (examTimetables) => set({ examTimetables }),
        setCurrentLanguage: (code) => set({ currentLanguage: code }),

        // exams (grouped) management
        setExams: (exams) => set({ exams }),

        /**
         * Fetch grouped exam results from backend API and store them.
         * Backend is expected to return already grouped results for the current student.
         */
        fetchExamsFromBackend: async (studentId?: string) => {
          set({ loading: true });
          try {
            const path = studentId
              ? `/api/v1/students/${studentId}/exams`
              : '/api/v1/exams';
            const res = await api.get(path);
            // expecting res.data.exams (grouped shape)
            const exams = Array.isArray(res.data?.exams) ? res.data.exams : [];
            set({ exams });
            return exams;
          } catch (err: unknown) {
            const msg =
              err instanceof Error ? err.message : 'Failed to load exams';
            toast({ title: 'Error', description: msg, variant: 'destructive' });
            return [];
          } finally {
            set({ loading: false });
          }
        },

        /**
         * getMyResults: returns only grouped exams (pre-processed by backend).
         * This guarantees components receive the normalized shape.
         */
        getMyResults: () => {
          const state = get();
          return Array.isArray(state.exams) ? state.exams : [];
        },

        // helpers to resolve metadata
        getSubjectById: (id?: string) => {
          if (!id) return null;
          const s = get().subjects.find((sub) => sub.id === id);
          return s ?? null;
        },

        getExamById: (id?: string) => {
          if (!id) return null;
          const e = get().exams.find((ex) => ex.id === id);
          return e ?? null;
        },

        // init auth watcher (keeps existing behavior)
        initCurrentUser: () => {
          try {
            onAuthStateChanged(auth, async (user) => {
              if (user) {
                try {
                  const response = await api.get(
                    `/api/v1/auth/users/${user.uid}`
                  );
                  const userData: User = response.data.user;
                  set({ currentUser: userData });
                } catch {
                  set({ currentUser: null });
                }
              } else {
                set({ currentUser: null });
              }
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'User not found!.';
            toast({
              title: 'Error',
              description: errorMessage,
              variant: 'destructive'
            });
          }
        },

        resetStore: () =>
          set({
            currentUser: null,
            teachers: [],
            students: [],
            subjects: [],
            sections: [],
            grades: [],
            attendance: [],
            circulars: [],
            homework: [],
            timetables: [],
            examTimetables: [],
            exams: [],
            activeView: 'dashboard',
            sidebarCollapsed: false,
            loading: false
          }),

        // computed helpers used elsewhere
        getStudentCount: () => get().students.length,
        getTeacherCount: () => get().teachers.length,
        getPresentStudentsToday: () => {
          const today = new Date().toISOString().split('T')[0];
          return get().attendance.filter(
            (a) => a.date === today && a.status === 'present'
          ).length;
        },
        // attendance helpers
        addAttendance: (record) => {
          set((state) => ({ attendance: [...(state.attendance || []), record] }));
        },
        updateAttendance: (id, patch) => {
          set((state) => ({
            attendance: (state.attendance || []).map((r) => (r.id === id ? { ...r, ...patch } : r))
          }));
        },
        getRecentCirculars: () =>
          get()
            .circulars.sort(
              (a, b) =>
                new Date(b.issued_date).getTime() -
                new Date(a.issued_date).getTime()
            )
            .slice(0, 5),

        // Student-specific methods
        getMyStudent: () => {
          const state = get();
          const currentUser = state.currentUser;
          if (!currentUser || currentUser.role !== 'student') return null;
          // Match by user id or find student with matching email/id
          return (
            state.students.find(
              (s) => s.id === currentUser.id || s.id === currentUser.email
            ) ?? state.students[0] ?? null
          );
        },

        getMyAttendance: () => {
          const state = get();
          const student = state.getMyStudent?.() ?? null;
          if (!student) return [];
          return state.attendance.filter((a) => a.student_id === student.id);
        },

        getMyTimetable: () => {
          const state = get();
          const student = state.getMyStudent?.() ?? null;
          if (!student) return [];
          return state.timetables.filter(
            (t) => t.section_id === student.section_id
          );
        },

        getMySubjects: () => {
          const state = get();
          const student = state.getMyStudent?.() ?? null;
          if (!student) return [];
          return state.subjects.filter((s) =>
            student.subject_ids?.includes(s.id)
          );
        },

        getMySection: () => {
          const state = get();
          const student = state.getMyStudent?.() ?? null;
          if (!student) return null;
          return (
            state.sections.find((s) => s.id === student.section_id) ?? null
          );
        },

        getMyGrade: () => {
          const state = get();
          const section = state.getMySection?.() ?? null;
          if (!section) return null;
          return state.grades.find((g) => g.id === section.grade_id) ?? null;
        }
      }),
      {
        name: 'school-store',
        // Selective persistence - only persist essential data to reduce localStorage size
        partialize: (state) => ({
          // Only persist UI state and current user, not large data arrays
          currentUser: state.currentUser,
          activeView: state.activeView,
          sidebarCollapsed: state.sidebarCollapsed,
          currentLanguage: state.currentLanguage,
          // Optionally persist a small subset of frequently accessed data
          // But limit size to prevent localStorage bloat
          subjects: state.subjects.slice(0, 50), // Limit to 50 most recent
          sections: state.sections.slice(0, 20), // Limit to 20 most recent
          grades: state.grades.slice(0, 20), // Limit to 20 most recent
        }),
        // Version for migration handling
        version: 1,
      }
    )
  )
);

// helper: seed sample grouped data for local/dev
export const initializeSampleData = () => {
  const store = useSchoolStore.getState();

  store.setStudents([
    {
      id: 'student_001',
      section_id: 'section_A',
      subject_ids: ['SUBJ-MATH', 'SUBJ-ENG'],
      roll_no: '001',
      dob: '2010-03-20',
      f_name: 'Jane',
      l_name: 'Smith',
      gender: 'Female',
      blood_group: 'O+',
      aadhar_no: '1234-5678-9012',
      phone_num1: '+91-9876543210',
      address_line1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      created_at: '2025-07-19T13:26:00Z',
      updated_at: '2025-07-19T13:26:00Z'
    },
    {
      id: 'student_002',
      section_id: 'section_A',
      subject_ids: ['SUBJ-MATH', 'SUBJ-ENG'],
      roll_no: '002',
      dob: '2010-05-10',
      f_name: 'Ravi',
      l_name: 'Kumar',
      gender: 'Male',
      phone_num1: '+91-9123456780',
      address_line1: '45 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400002',
      created_at: '2025-07-19T13:26:00Z',
      updated_at: '2025-07-19T13:26:00Z'
    },
    {
      id: 'student_003',
      section_id: 'section_B',
      subject_ids: ['SUBJ-SCI', 'SUBJ-HIST'],
      roll_no: '001',
      dob: '2010-08-12',
      f_name: 'Anita',
      l_name: 'Desai',
      gender: 'Female',
      phone_num1: '+91-9988776655',
      address_line1: '78 Lake Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411001',
      created_at: '2025-07-19T13:26:00Z',
      updated_at: '2025-07-19T13:26:00Z'
    }
  ]);

  // add sample sections
  store.setSections([
    { id: 'section_A', section_name: 'Grade 5 - A', grade_id: 'grade_5', class_teacher_id: 'teacher_001', group_name: 'A', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'section_B', section_name: 'Grade 5 - B', grade_id: 'grade_5', class_teacher_id: 'teacher_002', group_name: 'B', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);

  store.setTeachers([
    {
      id: 'teacher_001',
      subject_ids: ['SUBJ-MATH', 'SUBJ-PHY'],
      section_ids: ['section_A'],
      first_name: 'John',
      last_name: 'Doe',
      dob: '1985-06-15',
      gender: 'Male',
      designation: 'Senior Teacher',
      qualification: 'M.Sc Physics',
      doj: '2020-07-01',
      experienced_years: 8,
      created_at: '2025-07-19T13:26:00Z',
      updated_at: '2025-07-19T13:26:00Z'
    }
  ]);

  store.setSubjects([
    { id: 'SUBJ-MATH', subject_name: 'Mathematics', grade_id: 'grade_1', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    { id: 'SUBJ-ENG', subject_name: 'English', grade_id: 'grade_1', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    { id: 'SUBJ-SCI', subject_name: 'Science', grade_id: 'grade_2', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    { id: 'SUBJ-HIST', subject_name: 'History', grade_id: 'grade_2', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' }
  ]);

  // grouped exam results (backend-shaped)
  const groupedExamResults = [
    {
      id: 'EXAM-2025-JUL',
      title: 'Mid-Year Assessment (Jul 2025)',
      date: '2025-07-19T13:26:00Z',
      subjects: [
        { subject: 'Mathematics', marks: 85, maxMarks: 100, remark: 'pass' },
        { subject: 'English', marks: 78, maxMarks: 100, remark: 'pass' },
        { subject: 'Science', marks: 92, maxMarks: 100, remark: 'pass' }
      ],
      note: 'Good overall performance.'
    }
  ];

  store.setExams(groupedExamResults);
};
