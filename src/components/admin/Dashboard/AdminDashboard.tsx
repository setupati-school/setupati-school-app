import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSchoolStore } from '@/store/schoolStore';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Bell,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AdminQuickActions } from './AdminQuickActions';
import { StudentManagement } from './StudentManagement';
import { AdminStudentView } from './AdminStudentView';
import type { Student } from '@/types/schoolStoreType';
import { getGreeting } from '../../Students/utils';
import { attendanceRate } from '../../../lib/utils'

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    getStudentCount,
    getTeacherCount,
    getPresentStudentsToday,
    getRecentCirculars,
    currentUser,
    sections
  } = useSchoolStore();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const studentCount = getStudentCount();
  const teacherCount = getTeacherCount();
  const presentToday = getPresentStudentsToday();
  const recentCirculars = getRecentCirculars();
  const sectionCount = sections.length;

  const firstName = currentUser?.name?.split(' ')[0] ?? 'Admin';

  // If a student is selected, show their detailed view
  if (selectedStudent) {
    return (
      <AdminStudentView
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
        onEdit={(student) => {
          console.log('Edit student:', student);
          // Navigate to edit page or open modal
        }}
        onDelete={(student) => {
          console.log('Delete student:', student);
          // Show confirmation dialog
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's your school overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Students Card */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {studentCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active enrollments
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Card */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Teachers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {teacherCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Faculty members
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Present Today Card */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Present Today
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {presentToday}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <p className="text-xs text-success">{attendanceRate(studentCount, presentToday)}%</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections Card */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Active Sections
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {sectionCount || 4}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all grades
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Overview */}
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CalendarCheck className="h-4 w-4 text-success" />
                </div>
                <span>Today's Attendance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{attendanceRate(presentToday, studentCount)}%</p>
                  <p className="text-xs text-muted-foreground">
                    {presentToday} of {studentCount} students present
                  </p>
                </div>
                <Badge
                  variant={attendanceRate(studentCount, presentToday) >= 75 ? 'default' : 'destructive'}
                >
                  {attendanceRate(studentCount, presentToday) >= 90
                    ? 'Excellent'
                    : attendanceRate(studentCount, presentToday) >= 75
                      ? 'Good'
                      : 'Low'}
                </Badge>
              </div>
              <Progress value={attendanceRate(studentCount, presentToday)} className="h-2" />
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-destructive" />
                  </div>
                  <span>Recent Announcements</span>
                </div>
                <button
                  onClick={() => navigate('/circulars')}
                  className="text-xs text-primary hover:underline font-normal"
                >
                  View All
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCirculars.length > 0 ? (
                <div className="space-y-2">
                  {recentCirculars.slice(0, 3).map((circular: any) => (
                    <button
                      key={circular?.id}
                      onClick={() => navigate('/circulars')}
                      className="w-full flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="w-1 h-full min-h-[40px] rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {circular?.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {circular?.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {circular?.targeted_group}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(circular?.issued_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bell className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No announcements yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <StudentManagement onViewStudent={setSelectedStudent} />
          <AdminQuickActions />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
