import React, { useState, useEffect } from 'react';
import { useSchoolStore } from '@/store/schoolStore';
import api from '@/lib/axiosConfig';
import { useToast } from '@/hooks/use-toast';
import CreateAttendanceForm from './CreateAttendanceForm';
import AttendanceList from './AttendanceList';
import AttendanceSummary from './AttendanceSummary';
import { useAuthStore } from '@/store/authStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function AttendancePage() {
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { setAttendance } = useSchoolStore();
  const { toast } = useToast();

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/all');
      let data = Array.isArray(response.data) ? response.data : response.data?.attendance || [];
      data = data.map((item: any) => ({ id: item.id, ...(item.attendance || item) }));
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendance([]);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get('/sections/all');
      const data = response.data?.sections || response.data || [];
      const sectionsData = Array.isArray(data)
        ? data.map((item: any) => ({ id: item.id, ...(item.section || item) }))
        : [];
      useSchoolStore.getState().setSections(sectionsData);
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades/all');
      const data = response.data?.grades || response.data || [];
      const gradesData = Array.isArray(data)
        ? data.map((item: any) => ({ id: item.id, ...(item.grade || item) }))
        : [];
      useSchoolStore.getState().setGrades(gradesData);
    } catch (err) {
      console.error('Error fetching grades:', err);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchSections(), fetchGrades()]);
      fetchAttendance();
    })();
  }, []);

  const handleEdit = (g: any) => {
    (async () => {
      try {
        // fetch fresh group records from server using attendance id
        const aid = g?.attendanceId ?? g?.attendance_id ?? g?.attendanceId;
        if (!aid) {
          setEditingGroup(g);
          setEditModalOpen(true);
          return;
        }
        const res = await api.get(`/attendance/search/${encodeURIComponent(aid)}`);
        const rows = Array.isArray(res.data) ? res.data : [];
        const records = rows.map((it: any) => ({ id: it.id, ...(it.attendance || it) }));
        // create a loadGroup shaped object the form expects
        const loadGroup = { attendanceId: aid, section_id: g?.section_id ?? g?.sectionId, sectionId: g?.sectionId ?? g?.section_id, date: g?.date ?? (records[0]?.date ?? ''), records };
        setEditingGroup(loadGroup);
        setEditModalOpen(true);
      } catch (err) {
        console.error('Failed to fetch attendance group for edit', err);
        setEditingGroup(g);
        setEditModalOpen(true);
      }
    })();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Attendance</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {useAuthStore.getState().hasRole(['admin', 'teacher']) ? (
            <CreateAttendanceForm onSaved={fetchAttendance} />
          ) : (
            <div className="p-4 bg-white rounded-md shadow-sm text-sm text-gray-500">You do not have permission to create or edit attendance.</div>
          )}
          <AttendanceList onEdit={handleEdit} onDelete={fetchAttendance} onMountFetch={fetchAttendance} />
        </div>
        <div className="space-y-4">
          <AttendanceSummary />
        </div>
      </div>
    {/* Edit modal */}
      <Dialog open={editModalOpen} onOpenChange={(open) => { if (!open) setEditingGroup(null); setEditModalOpen(open); }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <CreateAttendanceForm loadGroup={editingGroup} onSaved={() => { setEditModalOpen(false); setEditingGroup(null); fetchAttendance(); }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
