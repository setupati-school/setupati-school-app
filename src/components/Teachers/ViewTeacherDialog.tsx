import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  BookOpen,
  Users
} from 'lucide-react';
import type { Teacher } from '@/types/schoolStoreType';

interface ViewTeacherDialogProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewTeacherDialog = ({
  teacher,
  open,
  onOpenChange
}: ViewTeacherDialogProps) => {
  if (!teacher) return null;

  const firstName = teacher?.first_name || teacher?.f_name || '';
  const lastName = teacher?.last_name || teacher?.l_name || '';
  const fullName = `${firstName} ${lastName}`?.trim() || 'Unknown';
  const initials =
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`?.toUpperCase() || 'T';
  const sectionIds = teacher?.section_ids || teacher?.section_id || [];
  const subjectIds = teacher?.subject_ids || teacher?.subject_id || [];

  const getExperienceColor = (years: number) => {
    if (years >= 10) return 'bg-success text-success-foreground';
    if (years >= 5) return 'bg-warning text-warning-foreground';
    return 'bg-primary-soft text-primary';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-accent text-accent-foreground">
                  {teacher?.designation || '-'}
                </Badge>
                <Badge
                  className={getExperienceColor(
                    teacher?.experienced_years ?? 0
                  )}
                >
                  {teacher?.experienced_years ?? 0} years exp.
                </Badge>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium">{teacher?.gender || '-'}</p>
              </div>
            </div>

            {/* Qualification */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Qualification</p>
                <p className="font-medium">{teacher?.qualification || '-'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium truncate">{teacher?.email || '-'}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{teacher?.phone_num || '-'}</p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {teacher?.dob
                    ? new Date(teacher?.dob)?.toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>

            {/* Date of Joining */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Joining</p>
                <p className="font-medium">
                  {teacher?.doj
                    ? new Date(teacher?.doj)?.toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          {subjectIds?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Subjects</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {subjectIds?.map((subjectId, index) => (
                  <Badge key={index} variant="outline">
                    {subjectId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {sectionIds?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Sections</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sectionIds?.map((sectionId, index) => (
                  <Badge key={index} variant="secondary">
                    {sectionId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
