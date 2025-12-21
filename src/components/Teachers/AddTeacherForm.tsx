import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { toast } from '@/hooks/use-toast';

interface AddTeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddTeacherForm = ({
  open,
  onOpenChange,
  onSuccess
}: AddTeacherFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    teacher_id: '',
    f_name: '',
    l_name: '',
    email: '',
    phone_num: '',
    gender: '',
    designation: '',
    qualification: '',
    experienced_years: 0,
    dob: '',
    doj: ''
  });

  const resetForm = () => {
    setFormData({
      teacher_id: '',
      f_name: '',
      l_name: '',
      email: '',
      phone_num: '',
      gender: '',
      designation: '',
      qualification: '',
      experienced_years: 0,
      dob: '',
      doj: ''
    });
  };

  const generateTeacherId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `TCH-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData?.f_name || !formData?.l_name) {
      toast({
        title: 'Error',
        description: 'First name and last name are required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const now = new Date()?.toISOString();
      const payload = {
        teacher_id: formData?.teacher_id || generateTeacherId(),
        f_name: formData?.f_name,
        l_name: formData?.l_name,
        email: formData?.email || null,
        phone_num: formData?.phone_num || null,
        gender: formData?.gender || null,
        designation: formData?.designation || null,
        qualification: formData?.qualification || null,
        experienced_years: Number(formData?.experienced_years) || 0,
        dob: formData?.dob ? new Date(formData?.dob)?.toISOString() : null,
        doj: formData?.doj ? new Date(formData?.doj)?.toISOString() : now,
        section_id: [],
        subject_id: [],
        created_at: now,
        updated_at: now
      };

      await api.post('/teachers/create', payload);

      toast({
        title: 'Success',
        description: 'Teacher added successfully'
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Teacher ID */}
            <div className="space-y-2">
              <Label htmlFor="teacher_id">Teacher ID (Optional)</Label>
              <Input
                id="teacher_id"
                placeholder="Auto-generated if empty"
                value={formData?.teacher_id ?? ''}
                onChange={(e) => handleChange('teacher_id', e?.target?.value)}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData?.gender ?? ''}
                onValueChange={(value) => handleChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="f_name">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="f_name"
                value={formData?.f_name ?? ''}
                onChange={(e) => handleChange('f_name', e?.target?.value)}
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="l_name">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="l_name"
                value={formData?.l_name ?? ''}
                onChange={(e) => handleChange('l_name', e?.target?.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData?.email ?? ''}
                onChange={(e) => handleChange('email', e?.target?.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone_num">Phone Number</Label>
              <Input
                id="phone_num"
                value={formData?.phone_num ?? ''}
                onChange={(e) => handleChange('phone_num', e?.target?.value)}
              />
            </div>

            {/* Designation */}
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Select
                value={formData?.designation ?? ''}
                onValueChange={(value) => handleChange('designation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                  <SelectItem value="Head of Department">
                    Head of Department
                  </SelectItem>
                  <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                  <SelectItem value="Junior Teacher">Junior Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Qualification */}
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                placeholder="e.g., M.Ed, B.Ed, PhD"
                value={formData?.qualification ?? ''}
                onChange={(e) =>
                  handleChange('qualification', e?.target?.value)
                }
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experienced_years">Experience (Years)</Label>
              <Input
                id="experienced_years"
                type="number"
                min="0"
                value={formData?.experienced_years ?? 0}
                onChange={(e) =>
                  handleChange('experienced_years', e?.target?.value)
                }
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData?.dob ?? ''}
                onChange={(e) => handleChange('dob', e?.target?.value)}
              />
            </div>

            {/* Date of Joining */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="doj">Date of Joining</Label>
              <Input
                id="doj"
                type="date"
                value={formData?.doj ?? ''}
                onChange={(e) => handleChange('doj', e?.target?.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
