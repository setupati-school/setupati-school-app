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
import { AlertTriangle, Trash2, Save, Info } from 'lucide-react';

type ActionType = 'delete' | 'save' | 'info';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  actionType?: ActionType;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  actionType = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmationModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (actionType) {
      case 'delete':
        return <Trash2 className="h-6 w-6 text-destructive" />;
      case 'save':
        return <Save className="h-6 w-6 text-primary" />;
      default:
        return <Info className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md w-[95vw] p-4 sm:p-6">
        <AlertDialogHeader>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            {actionType === 'delete' && (
              <div className="p-2 rounded-full bg-destructive/10 shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
            )}
            {actionType !== 'delete' && (
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                {getIcon()}
              </div>
            )}
            <AlertDialogTitle className="text-base sm:text-lg">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel className="w-full sm:w-auto mt-0">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
