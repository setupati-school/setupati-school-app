import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Phone,
  Calendar,
  GraduationCap,
  MapPin,
  Droplet,
  CreditCard,
  User
} from 'lucide-react';
import type { Student } from '@/types/schoolStoreType';
import { useSchoolStore } from '@/store/schoolStore';
import { getGrade, getSection, getInitial as initials} from '../../lib/utils';

interface ViewStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewStudentDialog = ({
  student,
  open,
  onOpenChange
}: ViewStudentDialogProps) => {
  const { sections, grades } = useSchoolStore();

  if (!student) return null;

  const fullName = `${student.f_name} ${student.l_name}`.trim() || 'Unknown';
  const gradeObj = getGrade(student.grade_id, grades, sections);
  const sectionObj = getSection(student.section_id, grades, sections);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-accent text-accent-foreground">
                  {gradeObj?.grade_name || '-'}
                </Badge>
                {sectionObj && (
                  <Badge variant="outline">Section {sectionObj?.section_name}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Roll No: {student.roll_no}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium">{student.gender || '-'}</p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {student.dob
                    ? new Date(student.dob).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>

            {/* Blood Group */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Droplet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Blood Group</p>
                <p className="font-medium">{student.blood_group || '-'}</p>
              </div>
            </div>

            {/* Aadhar */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Aadhar No</p>
                <p className="font-medium">
                  {student.aadhar_no
                    ? `XXXX-XXXX-${student.aadhar_no.slice(-4)}`
                    : '-'}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{student.phone_num1 || '-'}</p>
                {student.phone_num2 && (
                  <p className="text-xs text-muted-foreground">
                    Alt: {student.phone_num2}
                  </p>
                )}
              </div>
            {/* Grade & Section */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="font-medium">
                  {gradeObj?.grade_name || '-'}
                  {sectionObj ? ` - ${sectionObj.section_name}` : ''}
                </p>
              </div>
            </div>
              </div>
            </div>

          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Address</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                {student.address_line1 || '-'}
                {student.address_line2 && `, ${student.address_line2}`}
              </p>
              {student.landmark && (
                <p className="text-xs text-muted-foreground mt-1">
                  Landmark: {student.landmark}
                </p>
              )}
              <p className="text-sm mt-1">
                {[student.city, student.state, student.country]
                  .filter(Boolean)
                  .join(', ')}
                {student.pincode && ` - ${student.pincode}`}
              </p>
            </div>
          </div>

          {/* Subjects */}
          {student.subject_ids?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Enrolled Subjects</p>
              <div className="flex flex-wrap gap-2">
                {student.subject_ids.map((subjectId, index) => (
                  <Badge key={index} variant="outline">
                    {subjectId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
};
