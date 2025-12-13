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
import type { Student } from '@/types/schoolStoreType';
import api from '@/lib/axiosConfig';
import { toast } from '@/hooks/use-toast';
import { useSchoolStore } from '@/store/schoolStore';

interface EditStudentFormProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditStudentForm = ({
  student,
  open,
  onOpenChange,
  onSuccess
}: EditStudentFormProps) => {
  const { sections, grades } = useSchoolStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    roll_no: '',
    dob: '',
    gender: '',
    blood_group: '',
    aadhar_no: '',
    phone_num1: '',
    phone_num2: '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    section_id: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        f_name: student?.f_name || '',
        l_name: student?.l_name || '',
        roll_no: student?.roll_no || '',
        dob: student?.dob ? student?.dob.split('T')[0] : '',
        gender: student?.gender || '',
        blood_group: student?.blood_group || '',
        aadhar_no: student?.aadhar_no || '',
        phone_num1: student?.phone_num1 || '',
        phone_num2: student?.phone_num2 || '',
        address_line1: student?.address_line1 || '',
        address_line2: student?.address_line2 || '',
        landmark: student?.landmark || '',
        city: student?.city || '',
        state: student?.state || '',
        country: student?.country || '',
        pincode: student?.pincode || '',
        section_id: student?.section_id || ''
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setLoading(true);
    try {
      const payload = {
        f_name: formData?.f_name,
        l_name: formData?.l_name,
        dob: formData?.dob ? new Date(formData?.dob).toISOString() : '',
        gender: formData?.gender,
        blood_group: formData?.blood_group,
        aadhar_no: formData?.aadhar_no,
        phone_num1: formData?.phone_num1,
        phone_num2: formData?.phone_num2,
        address_line1: formData?.address_line1,
        address_line2: formData?.address_line2,
        landmark: formData?.landmark,
        city: formData?.city,
        state: formData?.state,
        country: formData?.country,
        pincode: formData?.pincode,
        section_id: formData?.section_id,
        updated_at: new Date().toISOString()
      };

      await api.put(`/students/update/${student.roll_no}`, payload);

      toast({
        title: 'Success',
        description: 'Student details updated successfully'
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="f_name">First Name *</Label>
                <Input
                  id="f_name"
                  value={formData?.f_name}
                  onChange={(e) => handleChange('f_name', e?.target?.value)}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="l_name">Last Name *</Label>
                <Input
                  id="l_name"
                  value={formData?.l_name}
                  onChange={(e) => handleChange('l_name', e?.target?.value)}
                  required
                />
              </div>

              {/* Roll No - Read Only */}
              <div className="space-y-2">
                <Label htmlFor="roll_no">Roll Number</Label>
                <Input id="roll_no" value={formData?.roll_no} disabled />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData?.dob}
                  onChange={(e) => handleChange('dob', e?.target?.value)}
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData?.gender}
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

              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group *</Label>
                <Select
                  value={formData?.blood_group}
                  onValueChange={(value) => handleChange('blood_group', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Aadhar */}
              <div className="space-y-2">
                <Label htmlFor="aadhar_no">Aadhar Number *</Label>
                <Input
                  id="aadhar_no"
                  value={formData?.aadhar_no}
                  onChange={(e) => handleChange('aadhar_no', e?.target?.value)}
                  maxLength={12}
                  required
                />
              </div>

              {/* Section */}
              <div className="space-y-2">
                <Label htmlFor="section_id">Section *</Label>
                <Select
                  value={formData?.section_id}
                  onValueChange={(value) => handleChange('section_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section: any) => {
                      const grade = grades.find((g: any) =>
                        g?.id === section?.grade_id || g?.grade_id === section?.grade_id
                      );
                      const sectionId = section.id || section.section_id;
                      return (
                        <SelectItem key={sectionId} value={sectionId}>
                          {grade?.grade_name || 'Unknown'} - Section {section?.section_name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone 1 */}
              <div className="space-y-2">
                <Label htmlFor="phone_num1">Primary Phone *</Label>
                <Input
                  id="phone_num1"
                  value={formData?.phone_num1}
                  onChange={(e) => handleChange('phone_num1', e?.target?.value)}
                  required
                />
              </div>

              {/* Phone 2 */}
              <div className="space-y-2">
                <Label htmlFor="phone_num2">Secondary Phone</Label>
                <Input
                  id="phone_num2"
                  value={formData?.phone_num2}
                  onChange={(e) => handleChange('phone_num2', e?.target?.value)}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Address Line 1 */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address_line1">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  value={formData?.address_line1}
                  onChange={(e) => handleChange('address_line1', e?.target?.value)}
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData?.address_line2}
                  onChange={(e) => handleChange('address_line2', e?.target?.value)}
                />
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData?.landmark}
                  onChange={(e) => handleChange('landmark', e?.target?.value)}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData?.city}
                  onChange={(e) => handleChange('city', e?.target?.value)}
                  required
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData?.state}
                  onChange={(e) => handleChange('state', e?.target?.value)}
                  required
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData?.country}
                  onChange={(e) => handleChange('country', e?.target?.value)}
                  required
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData?.pincode}
                  onChange={(e) => handleChange('pincode', e?.target?.value)}
                  required
                />
              </div>
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
