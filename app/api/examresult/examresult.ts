import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface SubjectMark {
  subject_id: string;
  marks: number;
}

interface ExamResult {
  student_id: string;
  exam_id: string;
  subjects: SubjectMark[];
  total: number;
  pass_or_fail: 'pass' | 'fail';
  created_at: string;
  updated_at: string;
}

const examResultCollection = db.collection('exam_results');

export const getAllExamResults = async (): Promise<(ExamResult & { id: string })[]> => {
  const snapshot = await examResultCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<ExamResult>(snapshot.docs);
};

export const getExamResultById = async (
  id: string
): Promise<(ExamResult & { id: string }) | null> => {
  const doc = await examResultCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<ExamResult>(doc);
};

export const getExamResultsByStudent = async (
  studentId: string
): Promise<(ExamResult & { id: string })[]> => {
  const snapshot = await examResultCollection.where('student_id', '==', studentId).get();
  if (snapshot.empty) return [];
  return docsToFlat<ExamResult>(snapshot.docs);
};

export const getExamResultsByExam = async (
  examId: string
): Promise<(ExamResult & { id: string })[]> => {
  const snapshot = await examResultCollection.where('exam_id', '==', examId).get();
  if (snapshot.empty) return [];
  return docsToFlat<ExamResult>(snapshot.docs);
};

export const addExamResult = async (
  data: Omit<ExamResult, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await examResultCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Exam result added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateExamResult = async (
  id: string,
  data: Partial<ExamResult>
): Promise<boolean> => {
  const docRef = examResultCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No exam result found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated exam result with ID: ${id}`);
  return true;
};

export const deleteExamResult = async (id: string): Promise<boolean> => {
  const docRef = examResultCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No exam result found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted exam result with ID: ${id}`);
  return true;
};
