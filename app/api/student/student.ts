import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Student {
  f_name: string;
  l_name: string;
  email: string;
  roll_no: string;
  grade_id: string;
  section_id: string;
  parent_id: string;
  dob: string;
  gender: string;
  phone_num: string;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  blood_group: string;
  aadhar_no: string;
  created_at: string;
  updated_at: string;
}

const studentCollection = db.collection('students');

export const getAllStudents = async (): Promise<(Student & { id: string })[]> => {
  const snapshot = await studentCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Student>(snapshot.docs);
};

export const getStudentById = async (id: string): Promise<(Student & { id: string }) | null> => {
  const doc = await studentCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Student>(doc);
};

export const getStudentsByRollNo = async (rollNo: string): Promise<(Student & { id: string })[]> => {
  const snapshot = await studentCollection.where('roll_no', '==', rollNo).get();
  if (snapshot.empty) return [];
  return docsToFlat<Student>(snapshot.docs);
};

export const addStudent = async (data: Omit<Student, 'created_at' | 'updated_at'>): Promise<string> => {
  const docRef = await studentCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Student added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateStudent = async (id: string, data: Partial<Student>): Promise<boolean> => {
  const docRef = studentCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No student found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated student with ID: ${id}`);
  return true;
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  const docRef = studentCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No student found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted student with ID: ${id}`);
  return true;
};
