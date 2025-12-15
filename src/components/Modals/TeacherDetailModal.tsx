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
  GraduationCap,
  Users
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  department: string;
  phone: string;
  email: string;
  designation: string;
  classes: string[];
  address?: string;
  joiningDate?: string;
  qualification?: string;
  salary?: string;
  experience?: string;
}

interface TeacherDetailModalProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeacherDetailModal = ({
  teacher,
  open,
  onOpenChange
}: TeacherDetailModalProps) => {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Teacher Details
              </DialogTitle>
              <DialogDescription className="text-sm">
                Complete information about {teacher.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 mt-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                    {teacher.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    {teacher.name}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {teacher.designation}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {teacher.department}
                  </Badge>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Phone
                    </p>
                    <p className="font-medium text-sm sm:text-base truncate">
                      {teacher.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Email
                    </p>
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {teacher.email}
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
                      {teacher.address || '123 Main Street, City'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Joining Date
                    </p>
                    <p className="font-medium text-sm">
                      {teacher.joiningDate || 'Aug 15, 2018'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base sm:text-lg">
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Subject
                      </p>
                      <p className="font-medium text-sm">{teacher.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Qualification
                      </p>
                      <p className="font-medium text-sm">
                        {teacher.qualification || 'M.Sc., B.Ed.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h4 className="font-semibold text-base sm:text-lg">
                    Assigned Classes
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacher.classes.map((cls, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
                    >
                      {cls}
                    </Badge>
                  ))}
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
                onClick={() => (window.location.href = `tel:${teacher.phone}`)}
                className="w-full sm:w-auto"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button
                onClick={() =>
                  (window.location.href = `mailto:${teacher.email}`)
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
