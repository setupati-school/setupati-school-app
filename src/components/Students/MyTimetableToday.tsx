import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSchoolStore } from '@/store/schoolStore';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DayOfWeek } from '@/types/schoolStoreType';
import {PERIODS as PERIOD_TIMES, DAYS_OF_WEEK as daysOfWeek } from '../../lib/utils';

export const MyTimetableToday = () => {
  const navigate = useNavigate();
  const { getMyTimetable, subjects, teachers } = useSchoolStore();

  const timetable = getMyTimetable?.() ?? [];

  const today = new Date().getDay();
  const currentDay: DayOfWeek | null =
    today >= 1 && today <= 6 ? daysOfWeek[today - 1] : null;

  const todaySchedule = currentDay
    ? timetable
        ?.filter((t) => t?.day_of_week === currentDay)
        ?.sort((a, b) => (a?.period ?? 0) - (b?.period ?? 0)) ?? []
    : [];

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'Subject';
    const subject = subjects?.find((s) => s?.id === subjectId);
    return subject?.subject_name ?? 'Subject';
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return '';
    const teacher = teachers?.find((t) => t?.id === teacherId);
    return teacher ? `${teacher?.first_name ?? ''} ${teacher?.last_name ?? ''}`.trim() : '';
  };

  const getPeriodTime = (period?: number) => {
    if (period === undefined || period === null) return 'Period';
    return PERIOD_TIMES[period - 1] ?? `Period ${period}`;
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <span>Today's Schedule</span>
          </div>
          <button
            onClick={() => navigate('/timetable')}
            className="text-xs text-primary hover:underline font-normal"
          >
            Full Week
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!currentDay ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">It's Sunday!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Enjoy your day off
            </p>
          </div>
        ) : todaySchedule.length === 0 ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No Classes</p>
            <p className="text-xs text-muted-foreground mt-1">
              No schedule for {currentDay}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="font-normal">
                {currentDay}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {todaySchedule?.length ?? 0} classes
              </span>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {todaySchedule?.map((period, index) => (
                <div
                  key={period?.id ?? `${period?.period ?? index}-${index}`}
                  className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {period?.period ?? index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getSubjectName(period?.subject_id)}
                    </p>
                    {getTeacherName(period?.teacher_id) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {getTeacherName(period?.teacher_id)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{getPeriodTime(period?.period)?.split(' - ')?.[0] ?? ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyTimetableToday;
