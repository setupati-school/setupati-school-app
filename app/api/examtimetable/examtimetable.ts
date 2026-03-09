import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

type ExamType = 'Unit Test' | 'Quarterly' | 'Half-Yearly' | 'Annual';

interface ExamTimetable {
  grade_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  exam_type: ExamType;
  created_at: string;
  updated_at: string;
}

const examTimetableCollection = db.collection('exam_timetables');

export const getAllExamTimetables = async (): Promise<(ExamTimetable & { id: string })[]> => {
  const snapshot = await examTimetableCollection.orderBy('date', 'asc').get();
  if (snapshot.empty) return [];
  return docsToFlat<ExamTimetable>(snapshot.docs);
};

export const getExamTimetableById = async (
  id: string
): Promise<(ExamTimetable & { id: string }) | null> => {
  const doc = await examTimetableCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<ExamTimetable>(doc);
};

export const getExamTimetablesByGrade = async (
  gradeId: string
): Promise<(ExamTimetable & { id: string })[]> => {
  const snapshot = await examTimetableCollection.where('grade_id', '==', gradeId).get();
  if (snapshot.empty) return [];
  return docsToFlat<ExamTimetable>(snapshot.docs);
};

export const addExamTimetable = async (
  data: Omit<ExamTimetable, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await examTimetableCollection.add({
    ...data,
    created_at: now(),
    updated_at: now()
  });
  logger.info(`Exam timetable added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateExamTimetable = async (
  id: string,
  data: Partial<ExamTimetable>
): Promise<boolean> => {
  const docRef = examTimetableCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No exam timetable found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated exam timetable with ID: ${id}`);
  return true;
};

export const deleteExamTimetable = async (id: string): Promise<boolean> => {
  const docRef = examTimetableCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No exam timetable found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted exam timetable with ID: ${id}`);
  return true;
};
