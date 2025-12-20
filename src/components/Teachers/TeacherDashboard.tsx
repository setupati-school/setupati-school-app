import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from './StatsCard';
import { useSchoolStore } from '@/store/schoolStore';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Bell,
  Calendar,
  BookOpen,
  AlertTriangle,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  attendanceRate,
  calculateAttendanceStats,
  getCurrentSchoolDay,
  getFirstName,
  getGreeting,
  PERIODS
} from '../../lib/utils';
import { useToast } from '@/hooks/use-toast';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    getStudentCount,
    getTeacherCount,
    getPresentStudentsToday,
    getRecentCirculars,
    currentUser,
    teachers,
    timetables,
    subjects,
    sections,
    students,
    attendance
  } = useSchoolStore();

  const studentCount = getStudentCount();
  const teacherCount = getTeacherCount();
  const presentToday = getPresentStudentsToday();
  const recentCirculars = getRecentCirculars();
  const firstName = getFirstName(currentUser?.name, 'Teacher');
  const {toast} = useToast();

  const todaySchedule = useMemo(() => {
    try {
      if (!currentUser || currentUser.role !== 'teacher') return [];

      const teacher = teachers.find(
        (t) =>
          t.email &&
          currentUser.email &&
          t.email.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (!teacher) return [];

      const todayName = getCurrentSchoolDay();
      if (!todayName) return [];

      const todaysTimetables = timetables.filter(
        (t) =>
          t.teacher_id === teacher.id && t.day_of_week === todayName
      );

      return todaysTimetables
        .map((t) => {
          const subject = subjects.find((s) => s.id === t.subject_id);
          const section = sections.find((s) => s.id === t.section_id);
          const periodInfo = PERIODS.find((p) => p.period === t.period);

          return {
            id: t.id ?? `${t.section_id}-${t.subject_id}-${t.period}`,
            subject: subject?.subject_name ?? 'Subject',
            section:
              section?.section_name ?? section?.group_name ?? 'Section',
            time: periodInfo
              ? `${periodInfo.startTime} - ${periodInfo.endTime}`
              : `Period ${t.period}`
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));
    } catch (err: any) {
      console.error(`An error occurred: ${err}`)
      toast({
        title: 'Error',
        description: 'An error occurred',
      });
    }
  }, [attendance, currentUser, sections, subjects, teachers, timetables]);

  const lowAttendanceStudents = useMemo(() => {
    try {
      if (!currentUser || currentUser.role !== 'teacher') return [];

      const teacher = teachers.find(
        (t) =>
          t.email &&
          currentUser.email &&
          t.email.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (!teacher || !Array.isArray(teacher.section_ids)) return [];

      const teacherSectionIds = new Set(teacher.section_ids ?? []);

      const myStudents = students.filter((s) =>
        teacherSectionIds.has(s.section_id)
      );

      if (myStudents.length === 0 || attendance.length === 0) return [];

      const stats = myStudents
        .map((s) => {
          const records = attendance.filter((a) => a.student_id === s.id);
          const { rate } = calculateAttendanceStats(records);

          return { student: s, rate };
        })
        .filter((item) => item.rate > 0 && item.rate < 75);

      return stats
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 3)
        .map(({ student, rate }) => {
          const section = sections.find(
            (sec) => sec.id === student.section_id
          );

          const name = `${student.f_name ?? ''} ${student.l_name ?? ''}`.trim();

          return {
            id: student.id,
            name: name || student.id,
            section:
              section?.section_name ?? section?.group_name ?? 'Section',
            rate
          };
        });
    } catch(err: any) {
      console.error(`An error occurred: ${err}`);
      toast({
        title: 'Error',
        description: 'An error occurred',
      });
    }
  }, [attendance, currentUser, sections, students, teachers]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your classes today
        </p>
      </div>

      {/* Top Stats Grid – teacher-focused */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Students You Teach"
          value={studentCount}
          icon={GraduationCap}
          description="Unique active students"
          trend={{ value: 4, isPositive: true }}
        />
        <StatsCard
          title="Classes Today"
          value={todaySchedule.length}
          icon={BookOpen}
          description="Scheduled periods"
          trend={{ value: 1, isPositive: true }}
        />
        <StatsCard
          title="Attendance Today"
          value={`${attendanceRate(studentCount, presentToday)}%`}
          icon={ClipboardCheck}
          description={`${presentToday} students present`}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Colleagues"
          value={teacherCount}
          icon={Users}
          description="Teachers in your school"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Circulars / Announcements */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Recent Announcements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCirculars.length > 0 ? (
              recentCirculars.map((circular) => (
                <div
                  key={circular.id}
                  className="border-l-2 border-primary pl-3 py-2"
                >
                  <h4 className="font-medium text-sm text-foreground">
                    {circular.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {circular.description.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {circular.targeted_group}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(circular.issued_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent announcements
              </p>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule – based on real timetable data */}
        <Card className="shadow-soft lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Today&apos;s Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySchedule.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No timetable found for today.
              </p>
            ) : (
              <div className="space-y-2">
                {todaySchedule.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-lg border bg-card flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {slot.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot.section}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[11px]">
                        {slot.time}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/attendance')}
                          className="text-[11px] text-primary hover:underline"
                        >
                          Mark attendance
                        </button>
                        <button
                          onClick={() => navigate('/students')}
                          className="text-[11px] text-muted-foreground hover:underline"
                        >
                          View class
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: Quick actions + students needing attention */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <button
                  className="p-3 text-left bg-primary-soft hover:bg-primary-soft/80 rounded-lg transition-colors"
                  onClick={() => navigate('/attendance')}
                >
                  <p className="font-medium text-sm text-primary">
                    Mark Attendance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Record today&apos;s attendance
                  </p>
                </button>
                <button
                  className="p-3 text-left bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                  onClick={() => navigate('/students')}
                >
                  <p className="font-medium text-sm text-accent-foreground">
                    View Student Info
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open your class roster
                  </p>
                </button>
                <button
                  className="p-3 text-left bg-success-soft hover:bg-success-soft/80 rounded-lg transition-colors"
                  onClick={() => navigate('/results')}
                >
                  <p className="font-medium text-sm text-success">
                    Upload Results
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add or update exam scores
                  </p>
                </button>
                <button
                  className="p-3 text-left bg-warning-soft hover:bg-warning-soft/80 rounded-lg transition-colors"
                  onClick={() => navigate('/circulars')}
                >
                  <p className="font-medium text-sm text-warning">
                    Create Circular
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Send an announcement
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Students Needing Attention – mock insight */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Students Needing Attention</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowAttendanceStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No students flagged based on attendance yet.
                </p>
              ) : (
                lowAttendanceStudents.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.section} • Attendance: {item.rate}%
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/students')}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Target className="h-3 w-3" />
                      View
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
