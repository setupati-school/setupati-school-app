import { z } from 'zod';

const genderEnum = z.enum(['Male', 'Female', 'Other']);
const relationEnum = z.enum(['Father', 'Mother', 'Guardian']);

export const studentSchema = z
  .object({
    student: z.object({
      f_name: z.string().min(1, 'First name is required'),
      l_name: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email'),
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
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export const teacherSchema = z
  .object({
    teacher: z.object({
      f_name: z.string().min(1, 'First name is required'),
      l_name: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email'),
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
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email')
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

  export const circularSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(5000, 'Description is too long'),
    issued_by: z.string().min(1, 'Issued by is required'),
    targeted_group: z.enum(['All', 'Students', 'Teachers', 'Parents'], {
      required_error: 'Please select a target group'
    }),
    issued_date: z.string().min(1, 'Issue date is required'),
    valid_until: z.string().min(1, 'Expiry date is required')
  });

  export const timetableSchema = z.object({
    day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], {
      required_error: 'Please select a day'
    }),
    period: z.number().min(1, 'Period must be at least 1').max(8, 'Period cannot exceed 8'),
    section_id: z.string().min(1, 'Please select a section'),
    subject_id: z.string().min(1, 'Please select a subject'),
    teacher_id: z.string().min(1, 'Please select a teacher')
  });

  export const subjectSchema = z.object({
    subject_name: z
      .string()
      .min(1, 'Subject name is required')
      .max(100, 'Subject name is too long'),
    grade_id: z.string().min(1, 'Please select a grade'),
    teacher_id: z.string().min(1, 'Please select a teacher'),
    description: z.string().optional()
  });

  export const examTimetableSchema = z.object({
    grade_id: z.string().min(1, 'Please select a grade'),
    subject_id: z.string().min(1, 'Please select a subject'),
    date: z.string().min(1, 'Please select an exam date'),
    start_time: z.string().min(1, 'Please enter start time'),
    end_time: z.string().min(1, 'Please enter end time'),
    exam_type: z.enum(['Unit Test', 'Quarterly', 'Half-Yearly', 'Annual'], {
      required_error: 'Please select an exam type'
    })
  });
