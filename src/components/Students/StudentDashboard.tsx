import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSchoolStore } from '@/store/schoolStore';
import { Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { MyTimetableToday } from './MyTimetableToday';
import { StudentQuickActions } from './StudentQuickActions';
import { ExamResultsSummary } from './ExamResultsSummary';
import { AttendanceSummary } from './AttendanceSummary';
import { CardHeaderWithIcon, EmptyState } from './shared';
import { getGreeting, getFirstName } from '../../lib/utils';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { getRecentCirculars, currentUser } = useSchoolStore();

  const recentCirculars = getRecentCirculars() ?? [];
  const firstName = getFirstName(currentUser?.name, 'Student');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening today
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <AttendanceSummary />
            <ExamResultsSummary />
          </div>

          {/* Announcements */}
          <Card className="shadow-soft">
            <CardHeaderWithIcon
              icon={<Bell className="h-4 w-4 text-destructive" />}
              iconBgClass="bg-destructive/10"
              title="Announcements"
              viewAllPath="/circulars"
            />
            <CardContent>
              {recentCirculars?.length > 0 ? (
                <div className="space-y-2">
                  {recentCirculars?.slice(0, 3)?.map((circular) => (
                    <button
                      key={circular?.id}
                      onClick={() => navigate('/circulars')}
                      className="w-full flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="w-1 h-full min-h-[40px] rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {circular?.title ?? 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {circular?.description ?? ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {circular?.targeted_group ?? 'All'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {circular?.issued_date
                              ? new Date(
                                  circular.issued_date
                                ).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Bell className="h-10 w-10" />}
                  message="No announcements yet"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <MyTimetableToday />
          <StudentQuickActions />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
