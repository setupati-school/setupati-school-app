import React, { useMemo } from 'react';
import { useSchoolStore } from '@/store/schoolStore';
import { useAuthStore } from '@/store/authStore';
import type { Attendance, Section } from '@/types';

type LatestAttendanceSummary = {
  date: string;
  sectionId: string;
  sectionName: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
};

export default function AttendanceSummary() {
  const attendances = useSchoolStore((s) => s.attendance as Attendance[]);
  const sections = useSchoolStore((s) => s.sections as Section[]);

  const sectionById = useMemo(() => {
    const m: Record<string, Section> = {};
    sections.forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [sections]);

  const latestSummary = useMemo<LatestAttendanceSummary | null>(() => {
    if (!attendances.length) return null;

    const { user, hasRole } = useAuthStore.getState();
    let relevant: Attendance[] & { attendanceId?: string }[] = attendances as any;

    if (user && hasRole(['student'])) {
      const myStudent = useSchoolStore.getState().getMyStudent?.();
      const sid = myStudent?.id ?? (user as any).uid;
      relevant = relevant.filter((r) => r.student_id === sid);
    } else if (user && hasRole(['teacher'])) {
      const store = useSchoolStore.getState();
      const teacher = store.teachers.find(
        (t) => t.id === (user as any).id || t.email === (user as any).email
      );
      const secIds =
        (teacher?.section_ids && teacher.section_ids.length
          ? teacher.section_ids
          : store.sections
              .filter((s) => s.class_teacher_id === teacher?.id)
              .map((s) => s.id)) ?? [];

      relevant = relevant.filter((r) => secIds.includes(r.section_id));
    }

    if (!relevant.length) return null;

    const groups: Record<
      string,
      { date: string; sectionId: string; records: Attendance[] }
    > = {};

    for (const rec of relevant) {
      const key =
        (rec as any).attendanceId ?? `${rec.section_id}_${rec.date}`;
      if (!groups[key]) {
        groups[key] = {
          date: rec.date,
          sectionId: rec.section_id,
          records: []
        };
      }
      groups[key].records.push(rec);
    }

    const latest = Object.values(groups).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (!latest) return null;

    const total = latest.records.length;
    const present = latest.records.filter((r) => r.status === 'present').length;
    const absent = latest.records.filter((r) => r.status === 'absent').length;
    const late = latest.records.filter((r) => r.status === 'late').length;
    const rate = total === 0 ? 0 : Math.round((present / total) * 100);

    const sectionName = sectionById[latest.sectionId]?.section_name ?? latest.sectionId;

    return {
      date: latest.date,
      sectionId: latest.sectionId,
      sectionName,
      total,
      present,
      absent,
      late,
      rate
    };
  }, [attendances, sectionById]);

  if (!latestSummary) {
    return (
      <div className="p-4 bg-white rounded-md shadow-sm text-sm text-gray-500">
        No attendance recorded yet.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <div className="text-sm text-gray-500">
        Latest Attendance ({latestSummary.date})
      </div>
      <div className="text-xs text-gray-500">{latestSummary.sectionName}</div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat label="Total Students" value={latestSummary.total} />
        <Stat label="Present" value={latestSummary.present} />
        <Stat label="Absent" value={latestSummary.absent} />
        <Stat label="Attendance %" value={`${latestSummary.rate}%`} />
        <div className="p-3 bg-gray-50 rounded col-span-2">
          <div className="text-xs text-gray-500">Late</div>
          <div className="text-lg font-semibold">{latestSummary.late}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 bg-gray-50 rounded">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
