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
  BookOpen
} from 'lucide-react';
import { attendanceRate } from '../../lib/utils';

export const TeacherDashboard = () => {
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

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Circulars */}
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

        {/* Today's Schedule */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">Morning Assembly</p>
                  <p className="text-xs text-muted-foreground">All Students</p>
                </div>
                <Badge variant="outline">9:00 AM</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-success-soft rounded-lg">
                <div>
                  <p className="font-medium text-sm">Math Period - Grade 10A</p>
                  <p className="text-xs text-muted-foreground">John Doe</p>
                </div>
                <Badge variant="outline">10:00 AM</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning-soft rounded-lg">
                <div>
                  <p className="font-medium text-sm">Parent Meeting</p>
                  <p className="text-xs text-muted-foreground">
                    Conference Room
                  </p>
                </div>
                <Badge variant="outline">2:00 PM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <button className="p-3 text-left bg-primary-soft hover:bg-primary-soft/80 rounded-lg transition-colors">
                <p className="font-medium text-sm text-primary">
                  Mark Attendance
                </p>
                <p className="text-xs text-muted-foreground">
                  Record today's attendance
                </p>
              </button>
              <button className="p-3 text-left bg-accent hover:bg-accent/80 rounded-lg transition-colors">
                <p className="font-medium text-sm text-accent-foreground">
                  Add Student
                </p>
                <p className="text-xs text-muted-foreground">
                  Register new student
                </p>
              </button>
              <button className="p-3 text-left bg-success-soft hover:bg-success-soft/80 rounded-lg transition-colors">
                <p className="font-medium text-sm text-success">
                  Create Circular
                </p>
                <p className="text-xs text-muted-foreground">
                  Send announcement
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
