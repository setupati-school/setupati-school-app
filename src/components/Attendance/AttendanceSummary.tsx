import React, { useMemo } from 'react';
import { useSchoolStore } from '@/store/schoolStore';

export default function AttendanceSummary() {
  const attendances = useSchoolStore((s) => s.attendance ?? []);
  const sections = useSchoolStore((s) => s.sections ?? []);

  const sectionById = useMemo(() => {
    const m: Record<string, any> = {};
    sections.forEach((s: any) => (m[s.id ?? s.section_id] = s));
    return m;
  }, [sections]);

  const latestSummary = useMemo(() => {
    if (!attendances.length) return null;

    const groups: Record<string, { date: string; sectionId: string; records: any[] }> = {};
    for (const rec of attendances) {
      const key = rec.attendanceId ?? `${rec.section_id}_${rec.date}`;
      if (!groups[key]) groups[key] = { date: rec.date, sectionId: rec.section_id, records: [] };
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

    return { date: latest.date, sectionId: latest.sectionId, sectionName, total, present, absent, late, rate };
  }, [attendances, sectionById]);

  if (!latestSummary) {
    return (
      <div className="p-4 bg-white rounded-md shadow-sm text-sm text-gray-500">No attendance recorded yet.</div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <div className="text-sm text-gray-500">Latest Attendance ({latestSummary.date})</div>
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
