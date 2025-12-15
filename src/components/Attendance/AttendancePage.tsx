import React, { useState } from 'react';
import CreateAttendanceForm from './CreateAttendanceForm';
import AttendanceList from './AttendanceList';
import AttendanceSummary from './AttendanceSummary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function AttendancePage() {
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = (g: any) => {
    setEditingGroup(g);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Attendance</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <CreateAttendanceForm onSaved={() => {}} />
          <AttendanceList onEdit={handleEdit} />
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
            <CreateAttendanceForm loadGroup={editingGroup} onSaved={() => { setEditModalOpen(false); setEditingGroup(null); }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
