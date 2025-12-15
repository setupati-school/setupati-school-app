import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  attendance: number;
  gpa: number;
  parentPhone: string;
  email: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  dob?: string;
  bloodGroup?: string;
  admissionDate?: string;
}

interface StudentDetailModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentDetailModal = ({
  student,
  open,
  onOpenChange
}: StudentDetailModalProps) => {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Student Details
              </DialogTitle>
              <DialogDescription className="text-sm">
                Complete information about {student.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 mt-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    {student.name}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Roll No. {student.rollNo}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Class {student.class}
                  </Badge>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Email
                    </p>
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {student.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium text-sm">
                      {student.dob || 'Jan 15, 2012'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Blood Group
                    </p>
                    <p className="font-medium text-sm">
                      {student.bloodGroup || 'B+'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Address
                    </p>
                    <p className="font-medium text-sm truncate">
                      {student.address || '456 School Lane, City'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base sm:text-lg">
                  Parent/Guardian Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Father's Name
                      </p>
                      <p className="font-medium text-sm truncate">
                        {student.fatherName || 'Mr. Suresh Kumar'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Mother's Name
                      </p>
                      <p className="font-medium text-sm truncate">
                        {student.motherName || 'Mrs. Sunita Kumar'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border sm:col-span-2">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Parent's Phone
                      </p>
                      <p className="font-medium text-sm">
                        {student.parentPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Performance */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base sm:text-lg">
                  Academic Performance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Attendance
                      </p>
                      <Badge
                        variant={
                          student.attendance >= 75 ? 'default' : 'destructive'
                        }
                      >
                        {student.attendance}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        GPA
                      </p>
                      <p className="font-medium text-sm">{student.gpa}/4.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                onClick={() =>
                  (window.location.href = `tel:${student.parentPhone}`)
                }
                className="w-full sm:w-auto"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Parent
              </Button>
              <Button
                onClick={() =>
                  (window.location.href = `mailto:${student.email}`)
                }
                className="w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
