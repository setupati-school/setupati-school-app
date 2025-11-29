import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Subject, Grade } from '@/types/schoolStoreType';
import { BookOpen, Eye, Pencil, Trash2, GraduationCap } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  grades: Grade[];
  isAdmin?: boolean;
  onView: (subject: Subject) => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

const getGradeName = (gradeId: string, grades: Grade[]): string => {
  const grade = grades.find((g) => g.id === gradeId);
  return grade?.grade_name || 'Unknown Grade';
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  grades,
  isAdmin = false,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <Card
      className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
      onClick={() => onView(subject)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-2 flex-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {subject.subject_name || 'Unnamed Subject'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 border-blue-500/20"
          >
            <GraduationCap className="h-3 w-3 mr-1" />
            {getGradeName(subject.grade_id || '', grades)}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {subject.created_at && (
              <span>
                Added {new Date(subject.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onView(subject);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isAdmin && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(subject);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(subject);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
