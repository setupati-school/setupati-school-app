import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/seperator';
import { Student } from '@/types/schoolStoreType';
import { useSchoolStore } from '@/store/schoolStore';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  CreditCard,
  School
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ViewStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export const ViewStudentDialog = ({
  open,
  onOpenChange,
  student
}: ViewStudentDialogProps) => {
  const { sections } = useSchoolStore();

  if (!student) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.section_name || sectionId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            View complete information about this student.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary-soft text-primary text-2xl">
                  {getInitials(student.f_name, student.l_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {student.f_name} {student.l_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{student.roll_no}</Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    {getSectionName(student.section_id)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{student.f_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{student.l_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">{formatDate(student.dob)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{student.gender}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Blood Group
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-success-soft text-success"
                      >
                        {student.blood_group}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Aadhar Number
                      </p>
                      <p className="font-medium">{student.aadhar_no}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <School className="h-5 w-5 mr-2 text-primary" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium">{student.roll_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Section</p>
                    <Badge className="bg-accent text-accent-foreground">
                      {getSectionName(student.section_id)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Primary Phone
                    </p>
                    <p className="font-medium">{student.phone_num1}</p>
                  </div>
                  {student.phone_num2 && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Secondary Phone
                      </p>
                      <p className="font-medium">{student.phone_num2}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Address
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">{student.address_line1}</p>
                  {student.address_line2 && (
                    <p className="text-muted-foreground">
                      {student.address_line2}
                    </p>
                  )}
                  {student.landmark && (
                    <p className="text-muted-foreground">
                      Near: {student.landmark}
                    </p>
                  )}
                  <p className="font-medium">
                    {student.city}, {student.state}
                  </p>
                  <p className="text-muted-foreground">
                    {student.country} - {student.pincode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Created: {formatDate(student.created_at)}</p>
              <p>Last Updated: {formatDate(student.updated_at)}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
