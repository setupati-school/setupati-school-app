import React, { useMemo } from 'react';
import { useSchoolStore } from '@/store/schoolStore';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordian';
import api from '@/lib/axiosConfig';
import { useToast } from '@/hooks/use-toast';

export default function AttendanceList({ onEdit }: { onEdit?: (group: any) => void }) {
  const attendances = useSchoolStore((s) => s.attendance ?? []);
  const sections = useSchoolStore((s) => s.sections ?? []);
  const students = useSchoolStore((s) => s.students ?? []);
  const grades = useSchoolStore((s) => s.grades ?? []);
  const setAttendance = useSchoolStore((s) => s.setAttendance);
  const { toast } = useToast();

  const sectionById = useMemo(() => {
    const m: Record<string, any> = {};
    sections.forEach((s: any) => m[s.id ?? s.section_id] = s);
    return m;
  }, [sections]);

  const studentById = useMemo(() => {
    const m: Record<string, any> = {};
    students.forEach((st: any) => m[st.id] = st);
    return m;
  }, [students]);

  const gradeById = useMemo(() => {
    const m: Record<string, any> = {};
    grades.forEach((g: any) => m[g.id ?? g.grade_id] = g);
    return m;
  }, [grades]);

  const getActualAttendanceId = (rec: any) => rec?.attendance_id ?? rec?.attendanceId;

  const getGroupActualAttendanceId = (records: any[]) => {
    if (!records || !records.length) return undefined;
    return getActualAttendanceId(records[0]);
  };

  const grouped = useMemo(() => {
    const gm: Record<string, Record<string, any>> = {};

    attendances.forEach((rec: any) => {
      const sectionId = rec.section_id;
      const section = sectionById[sectionId] ?? sectionById[rec.section_id ?? rec.sectionId];
      const gradeId = section?.grade_id ?? 'ungrouped';
      const key = rec.attendanceId ?? `${sectionId}_${rec.date}`;

      if (!gm[gradeId]) gm[gradeId] = {};
      if (!gm[gradeId][key]) gm[gradeId][key] = { date: rec.date, sectionId, records: [] };
      gm[gradeId][key].records.push(rec);
    });

    return Object.keys(gm).map((gradeId) => ({
      gradeId,
      gradeName: gradeById[gradeId]?.grade_name ?? gradeById[gradeId]?.id ?? (gradeId === 'ungrouped' ? 'Ungrouped' : gradeId),
      groups: Object.values(gm[gradeId]).sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
    })).sort((a, b) => a.gradeName.localeCompare(b.gradeName));
  }, [attendances, sectionById, gradeById]);

  if (!grouped.length) return <div className="p-4 text-sm text-gray-500">No attendance records yet.</div>;

  return (
    <div className="space-y-3">
      <Accordion type="multiple" collapsible className="space-y-2">
        {grouped.map((grade, gi) => (
          <AccordionItem key={grade.gradeId || gi} value={`grade-${gi}`}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{grade.gradeName}</div>
                </div>
                <div className="text-sm">Total records: <strong>{grade.groups.reduce((s: number, gg: any) => s + gg.records.length, 0)}</strong></div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="space-y-2">
                {grade.groups.map((g: any, idx: number) => (
                  <AccordionItem key={`${grade.gradeId}-${g.sectionId}-${g.date}-${idx}`} value={`grp-${gi}-${idx}`}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{sectionById[g.sectionId]?.section_name ?? g.sectionId}</div>
                          <div className="text-xs text-gray-500">{g.date}</div>
                        </div>
                        <div className="text-sm">
                          <span className="mr-3">Total: <strong>{g.records.length}</strong></span>
                          <span className="mr-3">Present: <strong>{g.records.filter((r: any) => r.status === 'present').length}</strong></span>
                          <span>Absent: <strong>{g.records.filter((r: any) => r.status === 'absent').length}</strong></span>
                        </div>
                        <div className="ml-4 flex items-center space-x-3">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              const realAid = getGroupActualAttendanceId(g.records);
                              if (!realAid) {
                                toast({ title: 'Missing id', description: 'Attendance id missing — cannot edit', variant: 'destructive' } as any);
                                return;
                              }
                              if (onEdit) onEdit({ attendanceId: realAid, section_id: g.sectionId, date: g.date, records: g.records });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                const realAid = getGroupActualAttendanceId(g.records);
                                if (!realAid) {
                                  toast({ title: 'Missing id', description: 'Attendance id missing — cannot edit', variant: 'destructive' } as any);
                                  return;
                                }
                                if (onEdit) onEdit({ attendanceId: realAid, section_id: g.sectionId, date: g.date, records: g.records });
                              }
                            }}
                            className="text-sm text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const aid = getGroupActualAttendanceId(g.records);
                              if (!aid) {
                                toast({ title: 'Missing id', description: 'Attendance id missing — cannot delete', variant: 'destructive' } as any);
                                return;
                              }
                              const ok = window.confirm(`Delete attendance for ${sectionById[g.sectionId]?.section_name ?? g.sectionId} on ${g.date}?`);
                              if (!ok) return;
                              try {
                                await api.delete(`/attendance/delete/${encodeURIComponent(aid)}`);
                                // remove from local store
                                const current = useSchoolStore.getState().attendance || [];
                                const others = current.filter((a: any) => getActualAttendanceId(a) !== aid);
                                setAttendance?.(others);
                                toast({ title: 'Deleted', description: 'Attendance deleted', variant: 'success' } as any);
                              } catch (err) {
                                console.error('Failed to delete attendance', err);
                                toast({ title: 'Error', description: 'Failed to delete attendance', variant: 'destructive' } as any);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                (e.target as HTMLElement).click();
                              }
                            }}
                            className="text-sm text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1">
                        {g.records.map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{studentById[r.student_id]?.f_name ?? studentById[r.student_id]?.first_name ?? r.student_id}</div>
                              <div className="text-xs text-gray-500">{r.student_id}</div>
                            </div>
                            <div className="text-sm">
                              <span className={`px-2 py-0.5 rounded ${r.status === 'present' ? 'bg-green-100 text-green-700' : r.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
