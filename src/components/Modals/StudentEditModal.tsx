import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Student } from './StudentDetailModal';

interface StudentEditModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (student: Student) => void;
  isNew?: boolean;
}

export const StudentEditModal = ({
  student,
  open,
  onOpenChange,
  onSave,
  isNew = false
}: StudentEditModalProps) => {
  const [formData, setFormData] = useState<Student>({
    id: '',
    name: '',
    rollNo: '',
    class: '',
    attendance: 0,
    gpa: 0,
    parentPhone: '',
    email: ''
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else if (isNew) {
      setFormData({
        id: Date.now().toString(),
        name: '',
        rollNo: '',
        class: '',
        attendance: 100,
        gpa: 0,
        parentPhone: '',
        email: ''
      });
    }
  }, [student, isNew]);

  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {isNew ? 'Add New Student' : 'Edit Student'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isNew
                  ? 'Fill in the details to add a new student'
                  : `Update information for ${formData.name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="text-sm">
                  Roll Number
                </Label>
                <Input
                  id="rollNo"
                  value={formData.rollNo}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNo: e.target.value })
                  }
                  placeholder="Enter roll number"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class" className="text-sm">
                  Class
                </Label>
                <Select
                  value={formData.class}
                  onValueChange={(value) =>
                    setFormData({ ...formData, class: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="VII A">VII A</SelectItem>
                    <SelectItem value="VII B">VII B</SelectItem>
                    <SelectItem value="VIII A">VIII A</SelectItem>
                    <SelectItem value="VIII B">VIII B</SelectItem>
                    <SelectItem value="IX A">IX A</SelectItem>
                    <SelectItem value="IX B">IX B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone" className="text-sm">
                  Parent Phone
                </Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, parentPhone: e.target.value })
                  }
                  placeholder="Enter parent's phone number"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName" className="text-sm">
                  Father's Name
                </Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, fatherName: e.target.value })
                  }
                  placeholder="Enter father's name"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName" className="text-sm">
                  Mother's Name
                </Label>
                <Input
                  id="motherName"
                  value={formData.motherName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, motherName: e.target.value })
                  }
                  placeholder="Enter mother's name"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-sm">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter address"
                  className="text-sm"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="w-full sm:w-auto">
                {isNew ? 'Add Student' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
