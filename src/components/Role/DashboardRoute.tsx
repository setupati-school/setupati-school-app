import React from 'react';
import { useAuthStore } from '@/store';
import { RoleRoute } from '@/components/Authentication';

const AdminDashboard = React.lazy(() =>
  import('@/components/admin/Dashboard/AdminDashboard').then((m) => ({
    default: m.AdminDashboard
  }))
);

const TeacherDashboard = React.lazy(() =>
  import('@/components/Teachers/TeacherDashboard').then((m) => ({
    default: m.TeacherDashboard
  }))
);

const StudentDashboard = React.lazy(() =>
  import('@/components/Students/StudentDashboard').then((m) => ({
    default: m.StudentDashboard
  }))
);

export const DashboardRoute: React.FC = () => {
  const { role } = useAuthStore();

  switch (role) {
    case 'admin':
      return (
        <RoleRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleRoute>
      );
    case 'teacher':
      return (
        <RoleRoute allowedRoles={['teacher']}>
          <TeacherDashboard />
        </RoleRoute>
      );
    case 'student':
      return (
        <RoleRoute allowedRoles={['student']}>
          <StudentDashboard />
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
