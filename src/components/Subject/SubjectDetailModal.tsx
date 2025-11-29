import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Subject, Grade } from '@/types/schoolStoreType';
import { BookOpen, GraduationCap, Calendar, Clock } from 'lucide-react';

interface SubjectDetailModalProps {
  subject: Subject | null;
  grades: Grade[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getGradeName = (gradeId: string, grades: Grade[]): string => {
  const grade = grades.find((g) => g.id === gradeId);
  return grade?.grade_name || 'Unknown Grade';
};

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  grades,
  open,
  onOpenChange
}) => {
  if (!subject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-semibold pr-8 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {subject.subject_name || 'Unnamed Subject'}
            </DialogTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-600 border-blue-500/20"
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              {getGradeName(subject.grade_id || '', grades)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DialogDescription className="text-foreground text-sm leading-relaxed">
            Subject details and information
          </DialogDescription>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>Subject Name</span>
              </div>
              <p className="text-sm font-medium">{subject.subject_name || 'Unnamed Subject'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>Grade</span>
              </div>
              <p className="text-sm font-medium">
                {getGradeName(subject.grade_id || '', grades)}
              </p>
            </div>

            {subject.created_at && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(subject.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {subject.updated_at && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last Updated</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(subject.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectDetailModal;
