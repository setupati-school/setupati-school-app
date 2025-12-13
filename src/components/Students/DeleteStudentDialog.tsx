import { useState } from 'react';
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
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import { Loader2 } from 'lucide-react';
import type { Student } from '@/types/schoolStoreType';
import api from '@/lib/axiosConfig';
import { toast } from '@/hooks/use-toast';

interface DeleteStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteStudentDialog = ({
  student,
  open,
  onOpenChange,
  onSuccess
}: DeleteStudentDialogProps) => {
  const [loading, setLoading] = useState(false);

  if (!student) return null;

  const fullName = `${student?.f_name} ${student?.l_name}`.trim() || 'Unknown';

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/students/delete/${student?.roll_no}`);

      toast({
        title: 'Success',
        description: 'Student deleted successfully'
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Student</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{fullName}</strong> (Roll No:{' '}
            {student?.roll_no})? This action cannot be undone and will permanently
            remove all student data including attendance records and exam results
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
