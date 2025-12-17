import React, { useMemo, useState } from 'react';
import { useSchoolStore } from '@/store/schoolStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axiosConfig';
import { Loader2 } from 'lucide-react';
import type { Attendance, Section, Student } from '@/types';

type AttendanceStatus = Attendance['status'];

type AttendanceGroup = {
  attendanceId: string;
  section_id: string;
  sectionId: string;
  date: string;
  records: (Attendance & { attendanceId?: string })[];
};

type CreateAttendanceFormProps = {
  loadGroup?: AttendanceGroup | null;
  onSaved?: () => void;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function CreateAttendanceForm({ loadGroup, onSaved }: CreateAttendanceFormProps) {
  const sections = useSchoolStore((s) => s.sections as Section[]);
  const students = useSchoolStore((s) => s.students as Student[]);
  const addAttendance = useSchoolStore((s) => s.addAttendance);
  const updateAttendance = useSchoolStore((s) => s.updateAttendance);
  const { toast } = useToast();

  const [date, setDate] = useState<string>(loadGroup?.date ?? todayISO());
  const [sectionId, setSectionId] = useState<string>(
    loadGroup?.section_id ?? loadGroup?.sectionId ?? sections[0]?.id ?? ''
  );

  // ensure default section is set when sections load
  React.useEffect(() => {
    if (!sectionId && sections.length > 0) {
      setSectionId(sections[0].id);
    }
  }, [sections, sectionId]);

  const sectionStudents = useMemo(() => {
    if (!sectionId) return [] as Student[];
    return students.filter((st) => st.section_id === sectionId);
  }, [students, sectionId]);

  // displayedStudents: prefer store's sectionStudents; if empty (store not populated), derive from loadGroup.records
  const displayedStudents = useMemo(() => {
    if (sectionStudents && sectionStudents.length) return sectionStudents;
    if (loadGroup && Array.isArray(loadGroup.records) && loadGroup.records.length) {
      return loadGroup.records.map((r) => ({
        id: r.student_id,
        f_name: (r as any).student_name ?? (r as any).name ?? r.student_id,
        roll_no: (r as any).roll_no ?? '-',
        section_id: loadGroup.section_id
      })) as unknown as Student[];
    }
    return [] as Student[];
  }, [sectionStudents, loadGroup]);

  const [statuses, setStatuses] = useState<Map<string, AttendanceStatus>>(
    () => {
      const map = new Map<string, AttendanceStatus>();
      displayedStudents.forEach((s) => map.set(s.id, 'present'));
      return map;
    }
  );
  const [loading, setLoading] = useState(false);

  // When section or students change, reset statuses to default for that section
  React.useEffect(() => {
    const map = new Map<string, AttendanceStatus>();
    displayedStudents.forEach((s) => map.set(s.id, 'present'));
    setStatuses(map);
  }, [sectionId, displayedStudents]);

  const { hasRole } = useAuthStore();
  const canEdit = hasRole(['admin', 'teacher']);

  // When a loadGroup is provided (edit), populate form values
  React.useEffect(() => {
    if (!loadGroup) return;

    if (loadGroup.section_id || loadGroup.sectionId) {
      setSectionId(loadGroup.section_id ?? loadGroup.sectionId);
    }
    if (loadGroup.date) {
      setDate(loadGroup.date);
    }

    const map = new Map<string, AttendanceStatus>();
    if (Array.isArray(loadGroup.records)) {
      loadGroup.records.forEach((r) => map.set(r.student_id, r.status ?? 'present'));
    }

    // ensure all students in section have entries (default present)
    displayedStudents.forEach((s) => {
      if (!map.has(s.id)) map.set(s.id, 'present');
    });
    setStatuses(map);
  }, [loadGroup, displayedStudents]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => new Map(prev).set(studentId, status));
  };

  const markAll = (status: AttendanceStatus) => {
    setStatuses((prev) => {
      const map = new Map(prev);
      sectionStudents.forEach((s) => map.set(s.id, status));
      return map;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!sectionId) {
      toast({
        title: 'Error',
        description: 'Please select a section',
        variant: 'destructive'
      } as any);
      return;
    }

    setLoading(true);

    const attendanceGroupId = `${sectionId}_${date}`;

    try {
      const stateAttendance = (useSchoolStore.getState().attendance ?? []) as (Attendance & {
        attendance_id?: string;
        attendanceId?: string;
      })[];

      // consider any record for this section + date as "existing" for that group
      const existing = stateAttendance.filter(
        (a) => a.section_id === sectionId && a.date === date
      );

      // use displayedStudents so edit dialog works even if students store is not fully populated
      for (const student of displayedStudents) {
        const status = statuses.get(student.id) ?? 'present';
        const now = new Date().toISOString();

        const found = existing?.find(
          (e) => e.student_id === student.id || (e as any).studentId === student.id
        );
        if (found) {
          // only update if status has changed
          if (found.status !== status) {
            try {
              const updateId =
                (found as any).attendance_id ?? found.attendanceId ?? found.id;
              await api.put(`/attendance/update/${updateId}`, {
                status,
                updated_at: now
              });
              updateAttendance?.(found.id, { status, updated_at: now });
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to update attendance', err);
              toast({
                title: 'Error',
                description: `Failed to update ${student.id}`,
                variant: 'destructive'
              } as any);
            }
          }
          // skip creation if existing
          // eslint-disable-next-line no-continue
          continue;
        }

        // create new record on server
        const payload = { student_id: student.id, section_id: sectionId, date, status };
        try {
          const res = await api.post('/attendance/create', payload);
          const created = res?.data ?? null;
          const record: Attendance & { attendanceId?: string } = {
            id: (created as any)?.attendance_id ?? (created as any)?.id ?? `att_${Date.now()}_${student.id}`,
            student_id: student.id,
            section_id: sectionId,
            date,
            status,
            created_at: now,
            updated_at: now,
            attendanceId: attendanceGroupId
          };
          addAttendance?.(record as any);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to add attendance', err);
          toast({
            title: 'Error',
            description: `Failed to add ${student.id}`,
            variant: 'destructive'
          } as any);
        }
      }

      toast({
        title: 'Saved',
        description: 'Attendance recorded',
        variant: 'success'
      } as any);
      if (onSaved) onSaved();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Attendance save failed', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance',
        variant: 'destructive'
      } as any);
    } finally {
      setLoading(false);
    }
  };

  const hasStudents = displayedStudents && displayedStudents.length > 0;

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-white rounded-md shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Section</label>
          {loadGroup ? (
            <div className="p-2 rounded bg-gray-50">
              {sections.find((s) => s.id === sectionId)?.section_name ?? sectionId}
            </div>
          ) : (
            <Select value={sectionId} onValueChange={(v) => setSectionId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec: Section) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.section_name ?? sec.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-end space-x-2">
          <Button type="button" onClick={() => markAll('present')} className="bg-green-500">
            All Present
          </Button>
          <Button type="button" onClick={() => markAll('absent')} className="bg-red-500">
            All Absent
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-gray-600 mb-2">Students</div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {!hasStudents && (
            <div className="text-sm text-gray-500">No students in this section.</div>
          )}
          {displayedStudents.map((stu) => (
            <div
              key={stu.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div>
                <div className="font-medium">
                  {(stu as any).f_name ?? (stu as any).first_name}{' '}
                  {(stu as any).l_name ?? (stu as any).last_name}
                </div>
                <div className="text-xs text-gray-500">
                  Roll: {(stu as any).roll_no ?? '-'}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={statuses.get(stu.id) ?? 'present'}
                  onValueChange={(v) => setStatus(stu.id, v as AttendanceStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        {canEdit ? (
          <Button type="submit" disabled={!sectionId || !hasStudents || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Attendance
          </Button>
        ) : (
          <div className="text-sm text-gray-500">
            You do not have permission to modify attendance.
          </div>
        )}
      </div>
    </form>
  );
}
