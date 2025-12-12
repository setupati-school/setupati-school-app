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
import type { Teacher } from '@/types/schoolStoreType';
import api from '@/lib/axiosConfig';
import { toast } from '@/hooks/use-toast';

interface DeleteTeacherDialogProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteTeacherDialog = ({
  teacher,
  open,
  onOpenChange,
  onSuccess
}: DeleteTeacherDialogProps) => {
  const [loading, setLoading] = useState(false);

  if (!teacher) return null;

  const firstName = teacher?.first_name || teacher?.f_name || '';
  const lastName = teacher?.last_name || teacher?.l_name || '';
  const fullName = `${firstName} ${lastName}`?.trim() || 'Unknown';

  const handleDelete = async () => {
    setLoading(true);
    try {
      const teacherId =
        (teacher as Teacher & { teacher_id?: string })?.teacher_id ||
        teacher?.id;

      await api.delete(`/teachers/delete/${teacherId}`);

      toast({
        title: 'Success',
        description: 'Teacher deleted successfully'
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{fullName}</strong>? This
            action cannot be undone and will permanently remove all teacher data
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
