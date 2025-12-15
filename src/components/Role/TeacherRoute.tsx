import React from 'react';
import { useAuthStore } from '@/store';
import { RoleRoute } from '@/components/Authentication';

const TeacherTeacherSection = React.lazy(() =>
  import('@/components/Teachers/Teacher').then((m) => ({
    default: m.TeacherSection
  }))
);

const StudentTeacherSection = React.lazy(() =>
  import('@/components/Students/Teacher').then((m) => ({
    default: m.TeacherSection
  }))
);

const AdminTeacherSection = React.lazy(() =>
  import('@/components/Admin/Teacher').then((m) => ({
    default: m.TeacherSection
  }))
);

export const TeacherRoute: React.FC = () => {
  const { role } = useAuthStore();

  switch (role) {
    case 'admin':
      return (
        <RoleRoute allowedRoles={['admin']}>
          <AdminTeacherSection />
        </RoleRoute>
      );
    case 'teacher':
      return (
        <RoleRoute allowedRoles={['teacher']}>
          <TeacherTeacherSection />
        </RoleRoute>
      );
    case 'student':
      return (
        <RoleRoute allowedRoles={['student']}>
          <StudentTeacherSection />
        </RoleRoute>
      );
    default:
      return (
        <div className="flex items-center justify-center h-screen text-red-600">
          Unauthorized Access
        </div>
      );
  }
};
