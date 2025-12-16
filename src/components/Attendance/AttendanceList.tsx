import React, { useMemo, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useSchoolStore } from '@/store/schoolStore';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordian';
import api from '@/lib/axiosConfig';
import { useToast } from '@/hooks/use-toast';

export default function AttendanceList({ onEdit, onDelete, onMountFetch }: { onEdit?: (group: any) => void; onDelete?: () => void; onMountFetch?: () => void }) {
  const attendances = useSchoolStore((s) => s.attendance ?? []);
  const { user, hasRole } = useAuthStore();
  const canEdit = hasRole(['admin', 'teacher']);
  const currentUser = user;
  const teacherRecord = useSchoolStore.getState().teachers.find((t: any) => t.id === currentUser?.id || t.email === currentUser?.email);
  const teacherSectionIds: string[] = (teacherRecord?.section_ids && teacherRecord.section_ids.length) ? teacherRecord.section_ids : (useSchoolStore.getState().sections.filter((s: any) => s.class_teacher_id === teacherRecord?.id).map((s: any) => s.id));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const sections = useSchoolStore((s) => s.sections ?? []);
  const students = useSchoolStore((s) => s.students ?? []);
  const grades = useSchoolStore((s) => s.grades ?? []);
  // no local mutations — parent will refetch
  const { toast } = useToast();

  useEffect(() => {
    if ((attendances?.length ?? 0) === 0 && onMountFetch) {
      onMountFetch();
    }
  }, []); // run once on mount

  const sectionById = useMemo(() => {
    const m: Record<string, any> = {};
    sections.forEach((s: any) => {
      if (s?.id) m[s.id] = s;
      if (s?.section_id) m[s.section_id] = s;
    });
    return m;
  }, [sections]);

  const studentById = useMemo(() => {
    const m: Record<string, any> = {};
    students.forEach((st: any) => m[st.id] = st);
    return m;
  }, [students]);

  const gradeById = useMemo(() => {
    const m: Record<string, any> = {};
    grades.forEach((g: any) => {
      if (g?.id) m[g.id] = g;
      if (g?.grade_id) m[g.grade_id] = g;
    });
    return m;
  }, [grades]);

  const getActualAttendanceId = (rec: any) => rec?.id ?? rec?.attendance_id ?? rec?.attendanceId;

  const getGroupActualAttendanceId = (records: any[]) => {
    if (!records || !records.length) return undefined;
    return getActualAttendanceId(records[0]);
  };
  const grouped = useMemo(() => {
    // limit visibility based on role
    let visible = attendances;
    if (currentUser && hasRole(['student'])) {
      const myStudent = useSchoolStore.getState().getMyStudent?.();
      const sid = myStudent?.id ?? currentUser?.id ?? currentUser?.email;
      visible = attendances.filter((r: any) => r.student_id === sid);
    } else if (currentUser && hasRole(['teacher']) && !hasRole(['admin'])) {
      const secIds = teacherSectionIds || [];
      visible = attendances.filter((r: any) => secIds.includes(r.section_id ?? r.sectionId));
    }
    // grade -> date -> section -> records
    const gm: Record<string, Record<string, Record<string, any>>> = {};

    visible.forEach((rec: any) => {
      const sectionId = rec.section_id ?? rec.sectionId ?? rec.section?.id ?? rec.section?.section_id ?? rec.section?.sectionId;
      const date = rec.date ?? rec.attendance_date ?? rec.created_at?.slice(0, 10);
      const section = sectionById[sectionId] || Object.values(sectionById).find((s: any) => s?.id === sectionId || s?.section_id === sectionId);
      const gradeId = section?.grade_id ?? section?.gradeId ?? rec.grade_id ?? rec.gradeId ?? rec.grade?.id ?? rec.grade?.grade_id ?? 'ungrouped';
      const sectionKey = sectionId ?? (section?.id ?? 'unknown');
      const dateKey = date ?? 'unknown-date';

      if (!gm[gradeId]) gm[gradeId] = {};
      if (!gm[gradeId][dateKey]) gm[gradeId][dateKey] = {};
      if (!gm[gradeId][dateKey][sectionKey]) gm[gradeId][dateKey][sectionKey] = { date: dateKey, sectionId: sectionKey, records: [] };
      gm[gradeId][dateKey][sectionKey].records.push(rec);
    });

    return Object.keys(gm).map((gradeId) => ({
      gradeId,
      gradeName: gradeById[gradeId]?.grade_name ?? gradeById[gradeId]?.name ?? gradeById[gradeId]?.id ?? (gradeId === 'ungrouped' ? 'Ungrouped' : gradeId),
      dates: Object.keys(gm[gradeId])
        .sort((a, b) => (a < b ? 1 : -1))
        .map((dateKey) => ({
          date: dateKey,
          sections: Object.values(gm[gradeId][dateKey]).map((s: any) => ({
            ...s,
            sectionName: sectionById[s.sectionId]?.section_name ?? sectionById[s.sectionId]?.name ?? s.sectionId
          }))
        }))
    })).sort((a, b) => a.gradeName.localeCompare(b.gradeName));
  }, [attendances, sectionById, gradeById, user, teacherSectionIds]);

  if (!grouped.length) return <div className="p-4 text-sm text-gray-500">No attendance records yet.</div>;

  return (
    <div className="space-y-3">
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance</AlertDialogTitle>
            <AlertDialogDescription>
              The following students' attendance records will be deleted for <strong>{deleteCandidate?.sectionName}</strong> on <strong>{deleteCandidate?.date}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 max-h-64 overflow-auto">
            {deleteCandidate?.records?.map((r: any) => (
              <div key={r.id} className="p-2 border-b">
                <div className="font-medium">{studentById[r.student_id]?.f_name ?? r.student_id}</div>
                <div className="text-xs text-gray-500">{r.student_id}</div>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteCandidate?.aid) return;
                try {
                  await api.delete(`/attendance/delete/${encodeURIComponent(deleteCandidate.aid)}`);
                  toast({ title: 'Deleted', description: 'Attendance deleted', variant: 'success' } as any);
                  setDeleteDialogOpen(false);
                  setDeleteCandidate(null);
                  if (onDelete) onDelete();
                } catch (err) {
                  console.error('Failed to delete attendance', err);
                  toast({ title: 'Error', description: 'Failed to delete attendance', variant: 'destructive' } as any);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Accordion type="multiple" collapsible className="space-y-2">
        {grouped.map((grade, gi) => (
          <AccordionItem key={grade.gradeId || gi} value={`grade-${gi}`}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{grade.gradeName}</div>
                </div>
                <div className="text-sm">Total records: <strong>{grade.dates.reduce((s: number, d: any) => s + d.sections.reduce((ss: number, sec: any) => ss + sec.records.length, 0), 0)}</strong></div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="multiple" collapsible className="space-y-2">
                {grade.dates.map((dateGroup: any, di: number) => (
                  <AccordionItem key={`${grade.gradeId}-${dateGroup.date}-${di}`} value={`date-${gi}-${di}`}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{dateGroup.date}</div>
                        </div>
                        <div className="text-sm">Sections: <strong>{dateGroup.sections.length}</strong></div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {dateGroup.sections.map((sec: any, si: number) => (
                          <AccordionItem key={`${grade.gradeId}-${dateGroup.date}-sec-${si}`} value={`sec-${gi}-${di}-${si}`}>
                            <AccordionTrigger>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <div className="font-medium">{sec.sectionName}</div>
                                  <div className="text-xs text-gray-500">{sec.date}</div>
                                </div>
                                <div className="text-sm">
                                  <span className="mr-3">Total: <strong>{sec.records.length}</strong></span>
                                  <span className="mr-3">Present: <strong>{sec.records.filter((r: any) => r.status === 'present').length}</strong></span>
                                  <span>Absent: <strong>{sec.records.filter((r: any) => r.status === 'absent').length}</strong></span>
                                </div>
                                <div className="ml-4 flex items-center space-x-3">
                                  {canEdit && (
                                    <>
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const realAid = getGroupActualAttendanceId(sec.records);
                                          if (!realAid) {
                                            toast({ title: 'Missing id', description: 'Attendance id missing — cannot edit', variant: 'destructive' } as any);
                                            return;
                                          }
                                          if (onEdit) onEdit({ attendanceId: realAid, section_id: sec.sectionId, sectionId: sec.sectionId, date: dateGroup.date, records: sec.records });
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
                                          const aid = getGroupActualAttendanceId(sec.records);
                                          if (!aid) {
                                            toast({ title: 'Missing id', description: 'Attendance id missing — cannot delete', variant: 'destructive' } as any);
                                            return;
                                          }
                                          // open a confirmation dialog listing students (no section dropdown)
                                          setDeleteCandidate({ aid, sectionName: sec.sectionName, date: dateGroup.date, records: sec.records });
                                          setDeleteDialogOpen(true);
                                        }}
                                        className="text-sm text-red-600 hover:underline cursor-pointer"
                                      >
                                        Delete
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="mt-2 space-y-1">
                                {sec.records.map((r: any) => (
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
