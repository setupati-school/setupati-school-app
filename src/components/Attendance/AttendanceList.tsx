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
    import type { Attendance, Grade, Section, Student } from '@/types';

type AttendanceWithMeta = Attendance & {
  attendanceId?: string;
  sectionId?: string;
  grade_id?: string;
  gradeId?: string;
};

type AttendanceGroupSection = {
  date: string;
  sectionId: string;
  sectionName: string;
  records: AttendanceWithMeta[];
};

type AttendanceGroupDate = {
  date: string;
  sections: AttendanceGroupSection[];
};

type AttendanceGroupByGrade = {
  gradeId: string;
  gradeName: string;
  dates: AttendanceGroupDate[];
};

type AttendanceListProps = {
  onEdit?: (group: {
    attendanceId: string;
    section_id: string;
    sectionId: string;
    date: string;
    records: AttendanceWithMeta[];
  }) => void;
  onDelete?: () => void;
  onMountFetch?: () => void;
};

type DeleteCandidate = {
  aid: string;
  sectionName: string;
  date: string;
  records: AttendanceWithMeta[];
};

const getActualAttendanceId = (rec: AttendanceWithMeta): string | undefined =>
  rec?.id ?? (rec as any)?.attendance_id ?? rec.attendanceId;

const getGroupActualAttendanceId = (records: AttendanceWithMeta[]): string | undefined => {
  if (!records || !records.length) return undefined;
  return getActualAttendanceId(records[0]);
};

const buildSectionMap = (sections: Section[]) => {
  const map: Record<string, Section> = {};
  sections.forEach((s) => {
    map[s.id] = s;
  });
  return map;
};

const buildStudentMap = (students: Student[]) => {
  const map: Record<string, Student> = {};
  students.forEach((s) => {
    map[s.id] = s;
  });
  return map;
};

const getStudentDisplayName = (student: Student | undefined): string => {
  if (!student) return '';
  const firstName = student.f_name || student.first_name || '';
  const lastName = student.l_name || student.last_name || '';
  return `${firstName} ${lastName}`.trim() || 'Unknown Student';
};

const getStudentRollNo = (student: Student | undefined): string => {
  return student?.roll_no || '';
};

const buildGradeMap = (grades: Grade[]) => {
  const map: Record<string, Grade> = {};
  grades.forEach((g) => {
    map[g.id] = g;
    if (g.grade_id) map[g.grade_id] = g;
  });
  return map;
};

const groupAttendanceByGrade = (
  attendances: AttendanceWithMeta[],
  opts: {
    sectionById: Record<string, Section>;
    gradeById: Record<string, Grade>;
  }
): AttendanceGroupByGrade[] => {
  const { sectionById, gradeById } = opts;

  // grade -> date -> section -> group
  const gm: Record<string, Record<string, Record<string, AttendanceGroupSection>>> = {};

  attendances.forEach((rec) => {
    const sectionId = rec.section_id ?? rec.sectionId;
    const date = rec.date;

    const section = (sectionId && sectionById[sectionId]) || null;

    const gradeId =
      section?.grade_id ??
      (rec as any).grade_id ??
      (rec as any).gradeId ??
      'general';

    const sectionKey = sectionId ?? section?.id ?? 'unknown';
    const dateKey = date ?? 'unknown-date';

    if (!gm[gradeId]) gm[gradeId] = {};
    if (!gm[gradeId][dateKey]) gm[gradeId][dateKey] = {};
    if (!gm[gradeId][dateKey][sectionKey]) {
      gm[gradeId][dateKey][sectionKey] = {
        date: dateKey,
        sectionId: sectionKey,
        sectionName:
          (section && (section.section_name ?? section.id)) ??
          sectionKey,
        records: []
      };
    }

    gm[gradeId][dateKey][sectionKey].records.push(rec);
  });

  return Object.keys(gm)
    .map<AttendanceGroupByGrade>((gradeId) => ({
      gradeId,
      gradeName:
        gradeById[gradeId]?.grade_name ??
        gradeById[gradeId]?.id ??
        gradeId,
      dates: Object.keys(gm[gradeId])
        .sort((a, b) => (a < b ? 1 : -1))
        .map((dateKey) => ({
          date: dateKey,
          sections: Object.values(gm[gradeId][dateKey])
        }))
    }))
    .sort((a, b) => a.gradeName.localeCompare(b.gradeName));
};

export default function AttendanceList({ onEdit, onDelete, onMountFetch }: AttendanceListProps) {
  const attendances = useSchoolStore((s) => (s.attendance ?? []) as AttendanceWithMeta[]);
  const { user, hasRole } = useAuthStore();
  const canEdit = hasRole(['admin', 'teacher']);
  const currentUser = user;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<DeleteCandidate | null>(null);

  const sections = useSchoolStore((s) => s.sections);
  const students = useSchoolStore((s) => s.students);
  const grades = useSchoolStore((s) => s.grades);

  // Pre-computed maps
  const sectionById = useMemo(() => buildSectionMap(sections), [sections]);
  const studentById = useMemo(() => buildStudentMap(students), [students]);
  const gradeById = useMemo(() => buildGradeMap(grades), [grades]);

  // Teacher section visibility
  const teacherSectionIds: string[] = useMemo(() => {
    if (!currentUser) return [];
    const store = useSchoolStore.getState();
    const teacherRecord = store.teachers.find(
      (t) => t.id === (currentUser as any).id || t.email === (currentUser as any).email
    );

    if (teacherRecord?.section_ids && teacherRecord.section_ids.length) {
      return teacherRecord.section_ids;
    }

    return store.sections
      .filter((s) => s.class_teacher_id === teacherRecord?.id)
      .map((s) => s.id);
  }, [currentUser]);

  // no local mutations — parent will refetch
  const { toast } = useToast();

  useEffect(() => {
    if ((attendances?.length ?? 0) === 0 && onMountFetch) {
      onMountFetch();
    }
    // we deliberately want this to run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo<AttendanceGroupByGrade[]>(() => {
    let visible: AttendanceWithMeta[] = attendances;

    if (currentUser && hasRole(['student'])) {
      const myStudent = useSchoolStore.getState().getMyStudent?.();
      const sid = myStudent?.id ?? (currentUser as any)?.id ?? (currentUser as any)?.email;
      visible = attendances.filter((r) => r.student_id === sid);
    } else if (currentUser && hasRole(['teacher']) && !hasRole(['admin'])) {
      const secIds = teacherSectionIds || [];
      visible = attendances.filter((r) => secIds.includes(r.section_id));
    }

    if (!visible.length) return [];

    return groupAttendanceByGrade(visible, { sectionById, gradeById });
  }, [attendances, currentUser, hasRole, teacherSectionIds, sectionById, gradeById]);

  if (!grouped.length) {
    return <div className="p-4 text-sm text-gray-500">No attendance records yet.</div>;
  }

  return (
    <div className="space-y-3">
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance</AlertDialogTitle>
            <AlertDialogDescription>
              The following students&apos; attendance records will be deleted for{' '}
              <strong>{deleteCandidate?.sectionName}</strong> on{' '}
              <strong>{deleteCandidate?.date}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 max-h-64 overflow-auto">
            {deleteCandidate?.records?.map((r) => {
              const student = studentById[r.student_id];
              const displayName = getStudentDisplayName(student);
              const rollNo = getStudentRollNo(student);
              return (
                <div key={r.id} className="p-2 border-b">
                  <div className="font-medium">{displayName || r.student_id}</div>
                  {rollNo && (
                    <div className="text-xs text-gray-500">Roll No: {rollNo}</div>
                  )}
                  {!student && (
                    <div className="text-xs text-gray-400">ID: {r.student_id}</div>
                  )}
                </div>
              );
            })}
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
                  // eslint-disable-next-line no-console
                  console.error('Failed to delete attendance', err);
                  toast({
                    title: 'Error',
                    description: 'Failed to delete attendance',
                    variant: 'destructive'
                  } as any);
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
                <div className="text-sm">
                  Total records:{' '}
                  <strong>
                    {grade.dates.reduce(
                      (sum, d) =>
                        sum +
                        d.sections.reduce((inner, sec) => inner + sec.records.length, 0),
                      0
                    )}
                  </strong>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="multiple" collapsible className="space-y-2">
                {grade.dates.map((dateGroup, di) => (
                  <AccordionItem
                    key={`${grade.gradeId}-${dateGroup.date}-${di}`}
                    value={`date-${gi}-${di}`}
                  >
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{dateGroup.date}</div>
                        </div>
                        <div className="text-sm">
                          Sections: <strong>{dateGroup.sections.length}</strong>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {dateGroup.sections.map((sec, si) => (
                          <AccordionItem
                            key={`${grade.gradeId}-${dateGroup.date}-sec-${si}`}
                            value={`sec-${gi}-${di}-${si}`}
                          >
                            <AccordionTrigger>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <div className="font-medium">{sec.sectionName}</div>
                                  <div className="text-xs text-gray-500">{sec.date}</div>
                                </div>
                                <div className="text-sm">
                                  <span className="mr-3">
                                    Total: <strong>{sec.records.length}</strong>
                                  </span>
                                  <span className="mr-3">
                                    Present:{' '}
                                    <strong>
                                      {sec.records.filter((r) => r.status === 'present').length}
                                    </strong>
                                  </span>
                                  <span>
                                    Absent:{' '}
                                    <strong>
                                      {sec.records.filter((r) => r.status === 'absent').length}
                                    </strong>
                                  </span>
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
                                            toast({
                                              title: 'Missing id',
                                              description: 'Attendance id missing — cannot edit',
                                              variant: 'destructive'
                                            } as any);
                                            return;
                                          }
                                          if (onEdit) {
                                            onEdit({
                                              attendanceId: realAid,
                                              section_id: sec.sectionId,
                                              sectionId: sec.sectionId,
                                              date: dateGroup.date,
                                              records: sec.records
                                            });
                                          }
                                        }}
                                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                                      >
                                        Edit
                                      </span>
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const aid = getGroupActualAttendanceId(sec.records);
                                          if (!aid) {
                                            toast({
                                              title: 'Missing id',
                                              description: 'Attendance id missing — cannot delete',
                                              variant: 'destructive'
                                            } as any);
                                            return;
                                          }
                                          setDeleteCandidate({
                                            aid,
                                            sectionName: sec.sectionName,
                                            date: dateGroup.date,
                                            records: sec.records
                                          });
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
                                {sec.records.map((r) => {
                                  const student = studentById[r.student_id];
                                  const displayName = getStudentDisplayName(student);
                                  const rollNo = getStudentRollNo(student);
                                  return (
                                    <div
                                      key={r.id}
                                      className="flex items-center justify-between p-2 border rounded"
                                    >
                                      <div>
                                        <div className="font-medium">
                                          {displayName || r.student_id}
                                        </div>
                                        {rollNo && (
                                          <div className="text-xs text-gray-500">
                                            Roll No: {rollNo}
                                          </div>
                                        )}
                                        {!student && (
                                          <div className="text-xs text-gray-400">
                                            ID: {r.student_id}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-sm">
                                        <span
                                          className={`px-2 py-0.5 rounded ${
                                            r.status === 'present'
                                              ? 'bg-green-100 text-green-700'
                                              : r.status === 'absent'
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-yellow-100 text-yellow-700'
                                          }`}
                                        >
                                          {r.status}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
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
