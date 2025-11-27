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
import { Student } from '@/types/schoolStoreType';
import { useSchoolStore } from '@/store/schoolStore';
import { studentService } from '@/services/studentService';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess?: () => void;
}

export const DeleteStudentDialog = ({
  open,
  onOpenChange,
  student,
  onSuccess
}: DeleteStudentDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { students, setStudents } = useSchoolStore();

  const handleDelete = async () => {
    if (!student) return;

    setIsDeleting(true);
    try {
      await studentService.delete(student.roll_no);

      const updatedStudents = students.filter((s) => s.id !== student.id);
      setStudents(updatedStudents);

      toast({
        title: 'Success',
        description: 'Student deleted successfully'
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!student) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Student</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold">
              {student.f_name} {student.l_name}
            </span>{' '}
            (Roll No: {student.roll_no})? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
