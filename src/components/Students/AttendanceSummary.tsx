import { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSchoolStore } from '@/store/schoolStore';
import { CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Attendance } from '@/types/schoolStoreType';

import {
  SummaryCard,
  CardHeaderWithIcon,
  LoadingState,
  EmptyState,
  StatItem,
  PercentageDisplay
} from './shared';
import {
  calculateAttendanceStats,
  getAttendanceStatusBadge
} from '../../lib/utils';

export const AttendanceSummary = () => {
  const { getMyAttendance } = useSchoolStore();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = getMyAttendance ? getMyAttendance() : [];
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [getMyAttendance]);

  const { total, present, absent, late, rate } = calculateAttendanceStats(records);
  const statusBadge = getAttendanceStatusBadge(rate);

  return (
    <SummaryCard>
      <CardHeaderWithIcon
        icon={<CalendarCheck className="h-4 w-4 text-success" />}
        iconBgClass="bg-success/10"
        title="Attendance"
        viewAllPath="/attendance"
      />
      <CardContent className="space-y-4">
        {loading ? (
          <LoadingState />
        ) : total === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="h-10 w-10" />}
            message="No attendance records yet"
          />
        ) : (
          <>
            <div className="text-center">
              <PercentageDisplay value={rate} />
              <Badge variant={statusBadge?.variant} className="mt-1">
                {statusBadge?.label}
              </Badge>
            </div>

            <Progress value={rate} className="h-2" />

            <div className="grid grid-cols-3 gap-2 pt-2">
              <StatItem
                icon={<CheckCircle className="h-4 w-4 text-success" />}
                value={present}
                label="Present"
                bgClass="bg-success/10"
              />
              <StatItem
                icon={<XCircle className="h-4 w-4 text-destructive" />}
                value={absent}
                label="Absent"
                bgClass="bg-destructive/10"
              />
              <StatItem
                icon={<Clock className="h-4 w-4 text-warning" />}
                value={late}
                label="Late"
                bgClass="bg-warning/10"
              />
            </div>

            <p className="text-[10px] text-center text-muted-foreground pt-1">
              Based on {total} school days
            </p>
          </>
        )}
      </CardContent>
    </SummaryCard>
  );
};

export default AttendanceSummary;
