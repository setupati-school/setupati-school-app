import React, { useState, useMemo } from 'react';
import {
  useForm,
  Controller,
  SubmitHandler,
  FieldPath,
  FieldValues,
  UseFormSetError
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Country, State, City } from 'country-state-city';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Upload, UserPlus, Users, Eye, EyeOff } from 'lucide-react';
import { studentSchema, teacherSchema } from '@/components/zod';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axiosConfig';

type StudentForm = z.infer<typeof studentSchema>;
type TeacherForm = z.infer<typeof teacherSchema>;
type BackendIssue = { path?: string; message?: string };

const ALL_COUNTRIES = Country.getAllCountries();

const formatAadhaar = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join('-');
};

const applyBackendIssuesToForm = <TFieldValues extends FieldValues>(
  issues: Array<{ path?: string; message?: string }> | undefined,
  setError: UseFormSetError<TFieldValues>
) => {
  if (!Array.isArray(issues)) return;
  issues.forEach((issue) => {
    if (!issue?.path) return;
    setError(issue.path as unknown as FieldPath<TFieldValues>, {
      type: 'server',
      message: issue.message || 'Invalid value'
    });
  });
};

const SignUpFormInner: React.FC = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<'student' | 'teacher'>('student');

  // Bulk upload simulation
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [studentLoading, setStudentLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showStudentConfirm, setShowStudentConfirm] = useState(false);
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [showTeacherConfirm, setShowTeacherConfirm] = useState(false);

  // CSC state for student (codes + internal keys)
  const [studentCountryCode, setStudentCountryCode] = useState('');
  const [studentStateCode, setStudentStateCode] = useState('');
  const [studentStateKey, setStudentStateKey] = useState('');
  const [studentCityKey, setStudentCityKey] = useState('');

  // =============== STUDENT FORM ===============
  const studentForm = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    mode: 'onSubmit',
    defaultValues: {
      student: {
        f_name: '',
        l_name: '',
        email: '',
        roll_no: '',
        grade_name: '',
        section_name: '',
        dob: '',
        gender: 'Male',
        phone_num: '',
        address_line1: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        blood_group: '',
        aadhar_no: ''
      },
      parent: {
        f_name: '',
        l_name: '',
        dob: '',
        gender: 'Male',
        occupation: '',
        relation: 'Father',
        phone_num: ''
      },
      password: '',
      confirmPassword: ''
    }
  });

  const studentStateOptions = useMemo(() => {
    if (!studentCountryCode) {
      return [] as ReturnType<typeof State.getStatesOfCountry>;
    }
    return State.getStatesOfCountry(studentCountryCode);
  }, [studentCountryCode]);

  const studentCityOptions = useMemo(() => {
    if (studentCountryCode && studentStateCode) {
      return City.getCitiesOfState(studentCountryCode, studentStateCode);
    }
    if (studentCountryCode) {
      return City.getCitiesOfCountry(studentCountryCode);
    }

    return [] as ReturnType<typeof City.getCitiesOfState>;
  }, [studentCountryCode, studentStateCode]);

  // =============== TEACHER FORM ===============
  const teacherForm = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    mode: 'onSubmit',
    defaultValues: {
      teacher: {
        f_name: '',
        l_name: '',
        email: '',
        designation: '',
        dob: '',
        doj: '',
        experienced_years: 0,
        gender: 'Male',
        qualification: '',
        phone_num: ''
      },
      password: '',
      confirmPassword: ''
    }
  });

  // =============== Bulk upload (simulated) ===============
  const simulateUpload = (type: 'Student' | 'Teacher') => {
    setIsUploading(true);
    setUploadProgress(0);
    const iv = setInterval(() => {
      setUploadProgress((p) => {
        const next = p + 12;
        if (next >= 100) {
          clearInterval(iv);
          setIsUploading(false);
          toast({
            title: 'Success',
            description: `${type} bulk upload done (simulated)`
          });
          return 100;
        }
        return next;
      });
    }, 250);
  };

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'Student' | 'Teacher'
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: 'Invalid file',
        description: 'Please upload .xlsx or .xls',
        variant: 'destructive'
      });
      return;
    }
    simulateUpload(type);
  };

  // =============== STUDENT SUBMIT ===============
  const onSubmitStudent: SubmitHandler<StudentForm> = async (data) => {
    if (studentLoading) return;
    setStudentLoading(true);
    try {
      const gradeInput = data?.student?.grade_name || '';
      const gradeId = gradeInput.charAt(0).toLowerCase() + gradeInput.slice(1);

      const sectionInput = data?.student?.section_name || '';
      const sectionId = sectionInput.charAt(0).toLowerCase() + sectionInput.slice(1);
      const { grade_name, section_name, ...studentDataWithoutNames } = data?.student;

      const payload = {
        student: {
          ...studentDataWithoutNames,
          grade_id: gradeId,
          section_id: sectionId
        },
        parent: { ...data?.parent },
        password: data?.password
      };

      const res = await api.post('/api/v1/auth/signup/create-student', payload);

      toast({
        title: 'Created',
        description: 'Student & parent created successfully'
      });

      studentForm.reset();
      // Clear all errors (including any root/form-level errors)
      studentForm.clearErrors();
      setStudentCountryCode('');
      setStudentStateCode('');
      setStudentStateKey('');
      setStudentCityKey('');

      return res.data;
    } catch (err: unknown) {
      const backendError = (err as { response?: { data?: unknown } })?.response
        ?.data as Record<string, unknown> | undefined;

      const msg =
        (backendError && (backendError.error as string)) ||
        (err instanceof Error ? err.message : 'Failed to create student');

      const studentIssues = backendError?.issues as BackendIssue[] | undefined;
      applyBackendIssuesToForm<StudentForm>(
        studentIssues,
        studentForm.setError
      );

      studentForm.setError('root' as unknown as FieldPath<StudentForm>, {
        type: 'server',
        message: msg
      });

      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setStudentLoading(false);
    }
  };

  const onInvalidStudent = () => {
    studentForm.setError('root' as unknown as FieldPath<StudentForm>, {
      type: 'validation',
      message: 'Please fill all required fields correctly before submitting.'
    });
    toast({
      title: 'Validation error',
      description: 'Please fix the highlighted fields and try again.',
      variant: 'destructive'
    });
  };

  // =============== TEACHER SUBMIT ===============
  const onSubmitTeacher: SubmitHandler<TeacherForm> = async (data) => {
    if (teacherLoading) return;
    setTeacherLoading(true);
    try {
      const payload = {
        teacher: {
          ...data.teacher,
          experienced_years: Number(data.teacher.experienced_years)
        },
        password: data.password
      };

      const res = await api.post('/api/v1/auth/signup/create-teacher', payload);

      toast({
        title: 'Created',
        description: 'Teacher created successfully'
      });

      teacherForm.reset();
      teacherForm.clearErrors();

      return res.data;
    } catch (err: unknown) {
      const backendError = (err as { response?: { data?: unknown } })?.response
        ?.data as Record<string, unknown> | undefined;

      const msg =
        (backendError && (backendError.error as string)) ||
        (err instanceof Error ? err.message : 'Failed to create teacher');

      const teacherIssues = backendError?.issues as BackendIssue[] | undefined;
      applyBackendIssuesToForm<TeacherForm>(
        teacherIssues,
        teacherForm.setError
      );

      teacherForm.setError('root' as unknown as FieldPath<TeacherForm>, {
        type: 'server',
        message: msg
      });

      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setTeacherLoading(false);
    }
  };

  const onInvalidTeacher = () => {
    teacherForm.setError('root' as unknown as FieldPath<TeacherForm>, {
      type: 'validation',
      message: 'Please fill all required fields correctly before submitting.'
    });
    toast({
      title: 'Validation error',
      description: 'Please fix the highlighted fields and try again.',
      variant: 'destructive'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-auto overflow-visible">
      <Tabs
        value={tab}
        onValueChange={(v: string) => setTab(v as 'student' | 'teacher')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Student & Parent
          </TabsTrigger>
          <TabsTrigger value="teacher" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Teacher
          </TabsTrigger>
        </TabsList>

        {/* ------------- STUDENT TAB ------------- */}
        {tab === 'student' && (
          <TabsContent value="student" className="space-y-4 mt-4">
            {/* Bulk upload */}
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                Bulk Upload via Excel
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFile(e, 'Student')
                  }
                  className="flex-1"
                  disabled={isUploading}
                />
                <Button variant="outline" size="icon" disabled={isUploading}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {isUploading && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or create manually
                </span>
              </div>
            </div>

            <div className="max-w-3xl mx-auto w-full px-4">
              <form
                onSubmit={studentForm.handleSubmit(
                  onSubmitStudent,
                  onInvalidStudent
                )}
                className="space-y-6"
                noValidate
              >
                {/* Root error */}
                {studentForm.formState.errors.root && (
                  <div className="rounded-md bg-destructive/10 border border-destructive px-3 py-2 text-sm text-destructive text-center">
                    {studentForm.formState.errors.root.message as string}
                  </div>
                )}

                {/* -------- Student Information -------- */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        placeholder="Enter your First Name"
                        {...studentForm.register('student.f_name')}
                      />
                      {studentForm.formState.errors.student?.f_name && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.f_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        placeholder="Enter your Last Name"
                        {...studentForm.register('student.l_name')}
                      />
                      {studentForm.formState.errors.student?.l_name && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.l_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        {...studentForm.register('student.email')}
                      />
                      {studentForm.formState.errors.student?.email && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Roll Number *</Label>
                      <Input
                        placeholder="123456"
                        {...studentForm.register('student.roll_no')}
                      />
                      {studentForm.formState.errors.student?.roll_no && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.roll_no.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Grade/Class *</Label>
                      <Input
                        placeholder="Enter Grade or Class (e.g., Grade_001)"
                        {...studentForm.register('student.grade_name')}
                      />
                      {studentForm.formState.errors.student?.grade_name && (
                        <p className="text-sm text-destructive">
                          {
                            studentForm.formState.errors.student.grade_name
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Section *</Label>
                      <Input
                        placeholder="Enter Section (e.g., Section_A)"
                        {...studentForm.register('student.section_name')}
                      />
                      {studentForm?.formState?.errors?.student?.section_name && (
                        <p className="text-sm text-destructive">
                          {
                            studentForm?.formState?.errors?.student?.section_name
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        {...studentForm.register('student.dob')}
                      />
                      {studentForm.formState.errors.student?.dob && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.dob.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Controller
                        control={studentForm.control}
                        name="student.gender"
                        render={({ field }) => (
                          <Select
                            onValueChange={(v: string) =>
                              field.onChange(v as 'Male' | 'Female' | 'Other')
                            }
                            value={field.value ?? ''}
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
                        )}
                      />
                      {studentForm.formState.errors.student?.gender && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.gender.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Blood Group *</Label>
                      <Input
                        placeholder="Enter your Blood Group"
                        {...studentForm.register('student.blood_group')}
                      />
                      {studentForm.formState.errors.student?.blood_group && (
                        <p className="text-sm text-destructive">
                          {
                            studentForm.formState.errors.student.blood_group
                              .message
                          }
                        </p>
                      )}
                    </div>

                    {/* Aadhaar with visual formatting */}
                    <div className="space-y-2">
                      <Label>Aadhar Number *</Label>
                      <Controller
                        control={studentForm.control}
                        name="student.aadhar_no"
                        render={({ field }) => (
                          <Input
                            inputMode="numeric"
                            maxLength={14}
                            placeholder="1234-5678-9012"
                            value={formatAadhaar(field.value ?? '')}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const digitsOnly = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 12);
                              field.onChange(digitsOnly);
                            }}
                            className="font-mono tracking-widest"
                          />
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter 12-digit Aadhar number.
                      </p>
                      {studentForm.formState.errors.student?.aadhar_no && (
                        <p className="text-sm text-destructive">
                          {
                            studentForm.formState.errors.student.aadhar_no
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        placeholder="Enter your 10-digit Phone Number"
                        {...studentForm.register('student.phone_num')}
                      />
                      {studentForm.formState.errors.student?.phone_num && (
                        <p className="text-sm text-destructive">
                          {
                            studentForm.formState.errors.student.phone_num
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address *</Label>
                    <Input
                      placeholder="Street address, house no., locality"
                      {...studentForm.register('student.address_line1')}
                    />
                    {studentForm.formState.errors.student?.address_line1 && (
                      <p className="text-sm text-destructive">
                        {
                          studentForm.formState.errors.student.address_line1
                            .message
                        }
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* City */}
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Select
                        value={studentCityKey}
                        onValueChange={(val: string) => {
                          setStudentCityKey(val);
                          const [countryCode, stateCode, cityName] =
                            val.split('|');

                          const countryObj =
                            Country.getCountryByCode(countryCode);
                          const stateObj = State.getStateByCodeAndCountry(
                            stateCode,
                            countryCode
                          );

                          const countryName = countryObj?.name ?? '';
                          const stateName = stateObj?.name ?? '';

                          setStudentCountryCode(countryCode);
                          setStudentStateCode(stateCode);
                          setStudentStateKey(`${countryCode}|${stateCode}`);

                          studentForm.setValue('student.country', countryName, {
                            shouldValidate: true
                          });
                          studentForm.setValue('student.state', stateName, {
                            shouldValidate: true
                          });
                          studentForm.setValue('student.city', cityName, {
                            shouldValidate: true
                          });
                        }}
                        disabled={!studentCountryCode}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              studentCountryCode
                                ? 'Select city'
                                : 'Select country first'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {studentCityOptions?.map((city) => (
                            <SelectItem
                              key={`${city.countryCode}-${city.stateCode}-${city.name}`}
                              value={`${city.countryCode}|${city.stateCode}|${city.name}`}
                            >
                              {city.name}
                              {city.stateCode ? `, ${city.stateCode}` : ''}
                              {city.countryCode ? ` (${city.countryCode})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {studentForm.formState.errors.student?.city && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.city.message}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select
                        value={studentStateKey}
                        onValueChange={(val: string) => {
                          setStudentStateKey(val);
                          const [countryCode, stateCode] = val.split('|');

                          const countryObj =
                            Country.getCountryByCode(countryCode);
                          const stateObj = State.getStateByCodeAndCountry(
                            stateCode,
                            countryCode
                          );

                          const countryName = countryObj?.name ?? '';
                          const stateName = stateObj?.name ?? '';

                          setStudentCountryCode(countryCode);
                          setStudentStateCode(stateCode);

                          setStudentCityKey('');
                          studentForm.setValue('student.city', '', {
                            shouldValidate: true
                          });

                          studentForm.setValue('student.country', countryName, {
                            shouldValidate: true
                          });
                          studentForm.setValue('student.state', stateName, {
                            shouldValidate: true
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {studentStateOptions.map((state) => (
                            <SelectItem
                              key={`${state.countryCode}-${state.isoCode}`}
                              value={`${state.countryCode}|${state.isoCode}`}
                            >
                              {state.name} ({state.countryCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {studentForm.formState.errors.student?.state && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.state.message}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Select
                        value={studentCountryCode}
                        onValueChange={(iso: string) => {
                          setStudentCountryCode(iso);
                          setStudentStateCode('');
                          setStudentStateKey('');
                          setStudentCityKey('');

                          const countryObj = Country.getCountryByCode(iso);
                          const countryName = countryObj?.name ?? '';

                          studentForm.setValue('student.country', countryName, {
                            shouldValidate: true
                          });
                          studentForm.setValue('student.state', '', {
                            shouldValidate: true
                          });
                          studentForm.setValue('student.city', '', {
                            shouldValidate: true
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_COUNTRIES.map((c) => (
                            <SelectItem key={c.isoCode} value={c.isoCode}>
                              {c.name} ({c.isoCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {studentForm.formState.errors.student?.country && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.country.message}
                        </p>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="space-y-2">
                      <Label>Pincode *</Label>
                      <Input
                        placeholder="Postal / ZIP code"
                        {...studentForm.register('student.pincode')}
                      />
                      {studentForm.formState.errors.student?.pincode && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.student.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* -------- Parent / Guardian -------- */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                    Parent / Guardian Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        placeholder="Parent's First Name"
                        {...studentForm.register('parent.f_name')}
                      />
                      {studentForm.formState.errors.parent?.f_name && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.parent.f_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        placeholder="Parent's Last Name"
                        {...studentForm.register('parent.l_name')}
                      />
                      {studentForm.formState.errors.parent?.l_name && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.parent.l_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        placeholder="Parent DOB"
                        {...studentForm.register('parent.dob')}
                      />
                      {studentForm.formState.errors.parent?.dob && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.parent.dob.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Controller
                        control={studentForm.control}
                        name="parent.gender"
                        render={({ field }) => (
                          <Select
                            onValueChange={(v: string) =>
                              field.onChange(v as 'Male' | 'Female' | 'Other')
                            }
                            value={field.value ?? ''}
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
                        )}
                      />
                      {studentForm.formState.errors.parent?.gender && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.parent.gender.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Relation *</Label>
                      <Controller
                        control={studentForm.control}
                        name="parent.relation"
                        render={({ field }) => (
                          <Select
                            onValueChange={(v: string) =>
                              field.onChange(
                                v as 'Father' | 'Mother' | 'Guardian'
                              )
                            }
                            value={field.value ?? ''}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Father">Father</SelectItem>
                              <SelectItem value="Mother">Mother</SelectItem>
                              <SelectItem value="Guardian">Guardian</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {studentForm.formState.errors.parent?.relation && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.parent.relation.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        placeholder="Parent's Phone Number"
                        {...studentForm.register('parent.phone_num')}
                      />
                      {studentForm.formState.errors.parent?.phone_num && (
                        <p className="text-sm text-destructive">
                          {
                            studentForm.formState.errors.parent.phone_num
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Occupation *</Label>
                      <Input
                        placeholder="e.g. Engineer, Homemaker"
                        {...studentForm.register('parent.occupation')}
                      />
                      {studentForm.formState.errors.parent?.occupation && (
                        <p className="text-sm text-destructive">
                          {
                            studentForm.formState.errors.parent.occupation
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* -------- Credentials -------- */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                    Account Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <Label>Password *</Label>
                      <Input
                        placeholder="Enter your password"
                        type={showStudentPassword ? 'text' : 'password'}
                        {...studentForm.register('password')}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-[30%]"
                        onClick={() => setShowStudentPassword((s) => !s)}
                      >
                        {showStudentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {studentForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 relative">
                      <Label>Confirm Password *</Label>
                      <Input
                        placeholder="Repeat password"
                        type={showStudentConfirm ? 'text' : 'password'}
                        {...studentForm.register('confirmPassword')}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-[30%]"
                        onClick={() => setShowStudentConfirm((s) => !s)}
                      >
                        {showStudentConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {studentForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {studentForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-center">
                  <Button
                    type="submit"
                    className="w-full max-w-md"
                    disabled={
                      studentLoading || studentForm.formState.isSubmitting
                    }
                  >
                    {studentLoading || studentForm.formState.isSubmitting
                      ? 'Creating...'
                      : 'Create Student & Parent Accounts'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        )}

        {/* ------------- TEACHER TAB ------------- */}
        {tab === 'teacher' && (
          <TabsContent value="teacher" className="space-y-4 mt-4">
            {/* Bulk upload */}
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                Bulk Upload Teachers via Excel
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFile(e, 'Teacher')
                  }
                  className="flex-1"
                  disabled={isUploading}
                />
                <Button variant="outline" size="icon" disabled={isUploading}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {isUploading && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or create manually
                </span>
              </div>
            </div>

            <div className="max-w-3xl mx-auto w-full px-4">
              <form
                onSubmit={teacherForm.handleSubmit(
                  onSubmitTeacher,
                  onInvalidTeacher
                )}
                className="space-y-6"
                noValidate
              >
                {teacherForm.formState.errors.root && (
                  <div className="rounded-md bg-destructive/10 border border-destructive px-3 py-2 text-sm text-destructive text-center">
                    {teacherForm.formState.errors.root.message as string}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                    Teacher Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        placeholder="Enter your First Name"
                        {...teacherForm.register('teacher.f_name')}
                      />
                      {teacherForm.formState.errors.teacher?.f_name && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.teacher.f_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        placeholder="Enter your Last Name"
                        {...teacherForm.register('teacher.l_name')}
                      />
                      {teacherForm.formState.errors.teacher?.l_name && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.teacher.l_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        {...teacherForm.register('teacher.email')}
                      />
                      {teacherForm.formState.errors.teacher?.email && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.teacher.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        placeholder="Enter your 10-digit Phone Number"
                        {...teacherForm.register('teacher.phone_num')}
                      />
                      {teacherForm.formState.errors.teacher?.phone_num && (
                        <p className="text-sm text-destructive">
                          {
                            teacherForm.formState.errors.teacher.phone_num
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Designation *</Label>
                      <Input
                        placeholder="e.g. Mathematics Teacher"
                        {...teacherForm.register('teacher.designation')}
                      />
                      {teacherForm.formState.errors.teacher?.designation && (
                        <p className="text-sm text-destructive">
                          {
                            teacherForm.formState.errors.teacher.designation
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Qualification *</Label>
                      <Input
                        placeholder="e.g. M.Sc, B.Ed"
                        {...teacherForm.register('teacher.qualification')}
                      />
                      {teacherForm.formState.errors.teacher?.qualification && (
                        <p className="text-sm text-destructive">
                          {
                            teacherForm.formState.errors.teacher.qualification
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        placeholder="Select date of birth"
                        {...teacherForm.register('teacher.dob')}
                      />
                      {teacherForm.formState.errors.teacher?.dob && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.teacher.dob.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Joining *</Label>
                      <Input
                        type="date"
                        placeholder="Select joining date"
                        {...teacherForm.register('teacher.doj')}
                      />
                      {teacherForm.formState.errors.teacher?.doj && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.teacher.doj.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        {...teacherForm.register('teacher.experienced_years')}
                      />
                      {teacherForm.formState.errors.teacher
                        ?.experienced_years && (
                        <p className="text-sm text-destructive">
                          {
                            teacherForm.formState.errors.teacher
                              .experienced_years.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Controller
                        control={teacherForm.control}
                        name="teacher.gender"
                        render={({ field }) => (
                          <Select
                            onValueChange={(v: string) =>
                              field.onChange(v as 'Male' | 'Female' | 'Other')
                            }
                            value={field.value ?? ''}
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
                        )}
                      />
                      {teacherForm.formState.errors.teacher?.gender && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.teacher.gender.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                    Account Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative space-y-2">
                      <Label>Password *</Label>
                      <Input
                        placeholder="Enter your password"
                        type={showTeacherPassword ? 'text' : 'password'}
                        {...teacherForm.register('password')}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-[30%]"
                        onClick={() => setShowTeacherPassword((s) => !s)}
                      >
                        {showTeacherPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {teacherForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="relative space-y-2">
                      <Label>Confirm Password *</Label>
                      <Input
                        type={showTeacherConfirm ? 'text' : 'password'}
                        placeholder="Repeat password"
                        {...teacherForm.register('confirmPassword')}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-[30%]"
                        onClick={() => setShowTeacherConfirm((s) => !s)}
                      >
                        {showTeacherConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {teacherForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {teacherForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-center">
                  <Button
                    type="submit"
                    className="w-full max-w-md"
                    disabled={
                      teacherLoading || teacherForm.formState.isSubmitting
                    }
                  >
                    {teacherLoading || teacherForm.formState.isSubmitting
                      ? 'Creating...'
                      : 'Create Teacher Account'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export const SignUpForm = React.memo(SignUpFormInner);
export default SignUpForm;
