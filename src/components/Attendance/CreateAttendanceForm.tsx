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
import api from '@/lib/axiosConfig';
import { Loader2 } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function CreateAttendanceForm({ loadGroup, onSaved }: { loadGroup?: any | null; onSaved?: () => void }) {
  const sections = useSchoolStore((s) => s.sections ?? []);
  const students = useSchoolStore((s) => s.students ?? []);
  const addAttendance = useSchoolStore((s) => s.addAttendance);
  const updateAttendance = useSchoolStore((s) => s.updateAttendance);
  const { toast } = useToast();

  const [date, setDate] = useState(todayISO());
  const [sectionId, setSectionId] = useState<string>(sections[0]?.section_id ?? sections[0]?.id ?? '');
  // ensure default section is set when sections load
  React.useEffect(() => {
    if (!sectionId && sections.length > 0) {
      setSectionId(sections[0].section_id ?? sections[0].id);
    }
  }, [sections, sectionId]);

  const sectionStudents = useMemo(() => {
    if (!sectionId) return [];
    return students.filter((st: any) => st.section_id === sectionId);
  }, [students, sectionId]);

  const handleSectionChange = (v: string) => {
    setSectionId(v);
    // immediately reset statuses for the newly selected section
    const filtered = students.filter((st: any) => st.section_id === v);
    const map = new Map<string, 'present' | 'absent' | 'late'>();
    filtered.forEach((s: any) => map.set(s.id, 'present'));
    setStatuses(map);
  };

  const initialMap = useMemo(() => {
    const map = new Map<string, 'present' | 'absent' | 'late'>();
    sectionStudents.forEach((s: any) => map.set(s.id, 'present'));
    return map;
  }, [sectionStudents]);

  const [statuses, setStatuses] = useState<Map<string, 'present' | 'absent' | 'late'>>(initialMap);
  const [loading, setLoading] = useState(false);

  // When section changes, reset statuses to default for that section
  React.useEffect(() => {
    const map = new Map<string, 'present' | 'absent' | 'late'>();
    sectionStudents.forEach((s: any) => map.set(s.id, 'present'));
    setStatuses(map);
  }, [sectionId, sectionStudents]);

  // When a loadGroup is provided (edit), populate form values
  React.useEffect(() => {
    if (!loadGroup) return;
    const sg = loadGroup as any;
    if (sg.section_id) setSectionId(sg.section_id);
    if (sg.date) setDate(sg.date);

    // build statuses map from records; re-run when sectionStudents available
    const map = new Map<string, 'present' | 'absent' | 'late'>();
    if (Array.isArray(sg.records)) {
      sg.records.forEach((r: any) => map.set(r.student_id, r.status ?? 'present'));
    }
    // ensure all students in section have entries (default present)
    sectionStudents.forEach((s: any) => {
      if (!map.has(s.id)) map.set(s.id, 'present');
    });
    setStatuses(map);
  }, [loadGroup, sectionStudents]);

  const setStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStatuses((prev) => new Map(prev).set(studentId, status));
  };

  const markAll = (status: 'present' | 'absent' | 'late') => {
    setStatuses((prev) => {
      const map = new Map(prev);
      sectionStudents.forEach((s: any) => map.set(s.id, status));
      return map;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (!sectionId) {
      toast({ title: 'Error', description: 'Please select a section', variant: 'destructive' } as any);
      setLoading(false);
      return;
    }

    const attendanceGroupId = `${sectionId}_${date}`;

    try {
      const existing = useSchoolStore.getState().attendance.filter((a: any) => a.attendanceId === attendanceGroupId);

      for (const student of sectionStudents) {
        const status = statuses.get(student.id) ?? 'present';
        const now = new Date().toISOString();

        const found = existing?.find((e: any) => e.student_id === student.id);
        if (found) {
          // only update if status has changed
          if (found.status !== status) {
            try {
              await api.put(`/attendance/update/${found.id}`, { status, updated_at: now });
              updateAttendance?.(found.id, { status, updated_at: now });
            } catch (err) {
              console.error('Failed to update attendance', err);
              toast({ title: 'Error', description: `Failed to update ${student.id}`, variant: 'destructive' } as any);
            }
          }
          continue;
        }

        // create new record on server
        const payload = { student_id: student.id, section_id: sectionId, date, status };
        try {
          const res = await api.post('/attendance/create', payload);
          const created = res?.data ?? null;
          const record = {
            id: created?.attendance_id ?? created?.id ?? `att_${Date.now()}_${student.id}`,
            attendanceId: attendanceGroupId,
            student_id: student.id,
            section_id: sectionId,
            date,
            status,
            created_at: now,
            updated_at: now
          };
          addAttendance?.(record as any);
        } catch (err) {
          console.error('Failed to add attendance', err);
          toast({ title: 'Error', description: `Failed to add ${student.id}`, variant: 'destructive' } as any);
        }
      }

      toast({ title: 'Saved', description: 'Attendance recorded', variant: 'success' } as any);
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Attendance save failed', error);
      toast({ title: 'Error', description: 'Failed to save attendance', variant: 'destructive' } as any);
    } finally {
      setLoading(false);
    }
  };

  const hasStudents = sectionStudents && sectionStudents.length > 0;

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-white rounded-md shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Section</label>
          <Select value={sectionId} onValueChange={(v) => handleSectionChange(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((sec: any) => (
                <SelectItem key={sec.section_id ?? sec.id} value={sec.section_id ?? sec.id}>
                  {sec.section_name ?? sec.name ?? sec.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2">
          <Button type="button" onClick={() => markAll('present')} className="bg-green-500">All Present</Button>
          <Button type="button" onClick={() => markAll('absent')} className="bg-red-500">All Absent</Button>
        </div>
      </div>

        <div className="mt-3">
        <div className="text-sm text-gray-600 mb-2">Students</div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {!hasStudents && (
            <div className="text-sm text-gray-500">No students in this section.</div>
          )}
          {sectionStudents.map((stu: any) => (
            <div key={stu.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{stu.f_name ?? stu.first_name} {stu.l_name ?? stu.last_name}</div>
                <div className="text-xs text-gray-500">Roll: {stu.roll_no ?? '-'}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={statuses.get(stu.id) ?? 'present'} onValueChange={(v) => setStatus(stu.id, v as any)}>
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
        <Button type="submit" disabled={!sectionId || !hasStudents || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Attendance
        </Button>
      </div>
    </form>
  );
}
