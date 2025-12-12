import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import { Loader2 } from 'lucide-react';
import type { Teacher } from '@/types/schoolStoreType';
import api from '@/lib/axiosConfig';
import { toast } from '@/hooks/use-toast';

interface EditTeacherFormProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditTeacherForm = ({
  teacher,
  open,
  onOpenChange,
  onSuccess
}: EditTeacherFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_num: '',
    gender: '',
    designation: '',
    qualification: '',
    experienced_years: 0,
    dob: '',
    doj: ''
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher?.first_name || teacher?.f_name || '',
        last_name: teacher?.last_name || teacher?.l_name || '',
        email: teacher?.email || '',
        phone_num: teacher?.phone_num || '',
        gender: teacher?.gender || '',
        designation: teacher?.designation || '',
        qualification: teacher?.qualification || '',
        experienced_years: teacher?.experienced_years ?? 0,
        dob: teacher?.dob ? teacher?.dob?.split('T')?.[0] : '',
        doj: teacher?.doj ? teacher?.doj?.split('T')?.[0] : ''
      });
    }
  }, [teacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    setLoading(true);
    try {
      const teacherId =
        (teacher as Teacher & { teacher_id?: string })?.teacher_id ||
        teacher?.id;

      const payload = {
        f_name: formData?.first_name,
        l_name: formData?.last_name,
        email: formData?.email,
        phone_num: formData?.phone_num,
        gender: formData?.gender,
        designation: formData?.designation,
        qualification: formData?.qualification,
        experienced_years: Number(formData?.experienced_years) || 0,
        dob: formData?.dob ? new Date(formData?.dob)?.toISOString() : '',
        doj: formData?.doj ? new Date(formData?.doj)?.toISOString() : '',
        updated_at: new Date()?.toISOString()
      };

      await api.put(`/teachers/update/${teacherId}`, payload);

      toast({
        title: 'Success',
        description: 'Teacher details updated successfully'
      });

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

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData?.first_name ?? ''}
                onChange={(e) => handleChange('first_name', e?.target?.value)}
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData?.last_name ?? ''}
                onChange={(e) => handleChange('last_name', e?.target?.value)}
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
            <div className="space-y-2">
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
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
