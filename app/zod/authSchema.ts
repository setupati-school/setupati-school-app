import { z } from 'zod';

const genderEnum = z.enum(['Male', 'Female', 'Other']);
const relationEnum = z.enum(['Father', 'Mother', 'Guardian']);

export const studentSchema = z.object({
  student: z.object({
    f_name: z.string().min(1, 'First name is required'),
    l_name: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'EmailID is required').email('Invalid email'),
    roll_no: z.string().min(1, 'Roll number required'),
    grade_name: z.string().min(1, 'Grade/Class required'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: genderEnum,
    phone_num: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    address_line1: z.string().min(1, 'Address line 1 is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    blood_group: z.string().min(1, 'Blood group is required'),
    aadhar_no: z
      .string()
      .regex(/^\d{12}$/, 'Aadhar number must be exactly 12 digits')
  }),
  parent: z.object({
    f_name: z.string().min(1, 'Parent first name required'),
    l_name: z.string().min(1, 'Parent last name required'),
    dob: z.string().min(1, 'Parent date of birth is required'),
    gender: genderEnum,
    occupation: z.string().min(1, 'Occupation is required'),
    relation: relationEnum,
    phone_num: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
  }),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const teacherSchema = z.object({
  teacher: z.object({
    f_name: z.string().min(1, 'First name is required'),
    l_name: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'EmailID is required').email('Invalid email'),
    designation: z.string().min(1, 'Designation required'),
    dob: z.string().min(1, 'Date of birth is required'),
    doj: z.string().min(1, 'Date of joining is required'),
    experienced_years: z.coerce
      .number()
      .int('Years of experience must be an integer')
      .nonnegative('Years of experience is required'),
    gender: genderEnum,
    qualification: z.string().min(1, 'Qualification is required'),
    phone_num: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
  }),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const getUserSchema = z.object({
  uid: z
    .string()
    .min(1, 'User ID is required')
    .regex(/^[A-Za-z0-9_-]{1,128}$/, 'Invalid User ID format')
});

export const validateEmailSchema = z.object({
  email: z.string().min(1, 'EmailID is required').email('Invalid email')
});

export const deleteUserSchema = z.object({
  uid: z
    .string()
    .min(1, 'User ID is required')
    .regex(/^[A-Za-z0-9_-]{1,128}$/, 'Invalid User ID format')
});

export type deleteUserSchemaPayload = z.infer<typeof deleteUserSchema>;
export type getUserSchemaPayload = z.infer<typeof getUserSchema>;
export type validateEmailSchemaPayload = z.infer<typeof validateEmailSchema>;
export type StudentSchemaPayload = z.infer<typeof studentSchema>;
export type TeacherSchemaPayload = z.infer<typeof teacherSchema>;
