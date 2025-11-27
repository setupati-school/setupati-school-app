import api from '@/lib/axiosConfig';
import { Student } from '@/types/schoolStoreType';

export interface StudentFormData {
  section_id: string;
  subject_ids: string[];
  roll_no: string;
  dob: string;
  f_name: string;
  l_name: string;
  gender: string;
  blood_group: string;
  aadhar_no: string;
  phone_num1: string;
  phone_num2?: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface StudentResponse {
  id: string;
  student: Student | null;
}

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get<StudentResponse[]>('/students/all');
    return response.data
      .filter((item) => item.student !== null)
      .map((item) => ({ ...item.student!, id: item.id }));
  },

  getByRollNo: async (rollNo: string): Promise<Student | null> => {
    const response = await api.get<StudentResponse[]>(
      `/students/search/${rollNo}`
    );
    if (response.data.length > 0 && response.data[0].student) {
      return { ...response.data[0].student, id: response.data[0].id };
    }
    return null;
  },

  create: async (data: StudentFormData): Promise<string> => {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      created_at: now,
      updated_at: now
    };
    const response = await api.post<{ id: string }>(
      '/students/create',
      payload
    );
    return response.data.id;
  },

  update: async (
    rollNo: string,
    data: Partial<StudentFormData>
  ): Promise<void> => {
    const payload = {
      ...data,
      updated_at: new Date().toISOString()
    };
    await api.put(`/students/update/${rollNo}`, payload);
  },

  delete: async (rollNo: string): Promise<void> => {
    await api.delete(`/students/delete/${rollNo}`);
  }
};
