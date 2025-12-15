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
import { Teacher } from './TeacherDetailModal';

interface TeacherEditModalProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (teacher: Teacher) => void;
  isNew?: boolean;
}

export const TeacherEditModal = ({
  teacher,
  open,
  onOpenChange,
  onSave,
  isNew = false
}: TeacherEditModalProps) => {
  const [formData, setFormData] = useState<Teacher>({
    id: '',
    name: '',
    subject: '',
    department: '',
    phone: '',
    email: '',
    designation: '',
    classes: []
  });

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    } else if (isNew) {
      setFormData({
        id: Date.now().toString(),
        name: '',
        subject: '',
        department: '',
        phone: '',
        email: '',
        designation: '',
        classes: []
      });
    }
  }, [teacher, isNew]);

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
                {isNew ? 'Add New Teacher' : 'Edit Teacher'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isNew
                  ? 'Fill in the details to add a new teacher'
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
                <Label htmlFor="phone" className="text-sm">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Enter subject"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm">
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-sm">
                  Designation
                </Label>
                <Select
                  value={formData.designation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, designation: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Senior Teacher">
                      Senior Teacher
                    </SelectItem>
                    <SelectItem value="HOD">HOD</SelectItem>
                    <SelectItem value="Sports Coach">Sports Coach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="classes" className="text-sm">
                  Assigned Classes (comma separated)
                </Label>
                <Input
                  id="classes"
                  value={formData.classes.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classes: e.target.value.split(',').map((c) => c.trim())
                    })
                  }
                  placeholder="e.g., VII A, VIII B, IX A"
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
                {isNew ? 'Add Teacher' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
