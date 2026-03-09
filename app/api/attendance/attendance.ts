import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Attendance {
  student_id: string;
  section_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  updated_at: string;
}

const attendanceCollection = db.collection('attendance');

export const getAllAttendance = async (): Promise<(Attendance & { id: string })[]> => {
  const snapshot = await attendanceCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Attendance>(snapshot.docs);
};

export const getAttendanceById = async (id: string): Promise<(Attendance & { id: string }) | null> => {
  const doc = await attendanceCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Attendance>(doc);
};

export const getAttendanceByStudent = async (
  studentId: string
): Promise<(Attendance & { id: string })[]> => {
  const snapshot = await attendanceCollection.where('student_id', '==', studentId).get();
  if (snapshot.empty) return [];
  return docsToFlat<Attendance>(snapshot.docs);
};

export const getAttendanceBySection = async (
  sectionId: string,
  date?: string
): Promise<(Attendance & { id: string })[]> => {
  let query = attendanceCollection.where('section_id', '==', sectionId);
  if (date) query = query.where('date', '==', date) as typeof query;
  const snapshot = await query.get();
  if (snapshot.empty) return [];
  return docsToFlat<Attendance>(snapshot.docs);
};

export const addAttendance = async (
  data: Omit<Attendance, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await attendanceCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Attendance added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateAttendance = async (id: string, data: Partial<Attendance>): Promise<boolean> => {
  const docRef = attendanceCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No attendance record found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated attendance with ID: ${id}`);
  return true;
};

export const deleteAttendance = async (id: string): Promise<boolean> => {
  const docRef = attendanceCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No attendance record found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted attendance with ID: ${id}`);
  return true;
};
