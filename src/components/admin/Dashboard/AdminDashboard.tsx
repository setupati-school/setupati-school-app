import { StatsCard } from './StatsCard';
import { useSchoolStore } from '@/store/schoolStore';
import { Users, GraduationCap, ClipboardCheck, BookOpen } from 'lucide-react';
import {
  TodaySchedule,
  QuickActions,
  RecentAnnouncements
} from '@/components/Dashboard';

export const AdminDashboard = () => {
  const {
    getStudentCount,
    getTeacherCount,
    getPresentStudentsToday,
    getRecentCirculars
  } = useSchoolStore();

  const studentCount = getStudentCount();
  const teacherCount = getTeacherCount();
  const presentToday = getPresentStudentsToday();
  const recentCirculars = getRecentCirculars();

  const attendanceRate =
    studentCount > 0 ? Math.round((presentToday / studentCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={studentCount}
          icon={GraduationCap}
          description="Active enrollments"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Teachers"
          value={teacherCount}
          icon={Users}
          description="Faculty members"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Present Today"
          value={presentToday}
          icon={ClipboardCheck}
          description={`${attendanceRate}% attendance rate`}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Active Sections"
          value={4}
          icon={BookOpen}
          description="Across all grades"
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RecentAnnouncements circulars={recentCirculars} />
        <TodaySchedule />
        <QuickActions />
      </div>
    </div>
  );
};
