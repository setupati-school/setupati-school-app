import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { SchoolStore, User } from '@/types/schoolStoreType';
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
        exams: [], // grouped exam results from backend
        activeView: 'dashboard',
        sidebarCollapsed: false,
        loading: false,

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
        getRecentCirculars: () =>
          get()
            .circulars.sort(
              (a, b) =>
                new Date(b.issued_date).getTime() -
                new Date(a.issued_date).getTime()
            )
            .slice(0, 5)
      }),
      {
        name: 'school-store'
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
    }
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
    { id: 'SUBJ-MATH', name: 'Mathematics' },
    { id: 'SUBJ-ENG', name: 'English' },
    { id: 'SUBJ-SCI', name: 'Science' },
    { id: 'SUBJ-HIST', name: 'History' }
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
