import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Teacher {
  f_name: string;
  l_name: string;
  email: string;
  designation: string;
  dob: string;
  doj: string;
  experienced_years: number;
  gender: string;
  qualification: string;
  phone_num: string;
  created_at: string;
  updated_at: string;
}

const teacherCollection = db.collection('teachers');

export const getAllTeachers = async (): Promise<(Teacher & { id: string })[]> => {
  const snapshot = await teacherCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Teacher>(snapshot.docs);
};

export const getTeacherById = async (id: string): Promise<(Teacher & { id: string }) | null> => {
  const doc = await teacherCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Teacher>(doc);
};

export const addTeacher = async (data: Omit<Teacher, 'created_at' | 'updated_at'>): Promise<string> => {
  const docRef = await teacherCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Teacher added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateTeacher = async (id: string, data: Partial<Teacher>): Promise<boolean> => {
  const docRef = teacherCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No teacher found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated teacher with ID: ${id}`);
  return true;
};

export const deleteTeacher = async (id: string): Promise<boolean> => {
  const docRef = teacherCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No teacher found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted teacher with ID: ${id}`);
  return true;
};
