import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Subject {
  subject_name: string;
  grade_id: string;
  created_at: string;
  updated_at: string;
}

const subjectCollection = db.collection('subjects');

export const getAllSubjects = async (): Promise<(Subject & { id: string })[]> => {
  const snapshot = await subjectCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Subject>(snapshot.docs);
};

export const getSubjectById = async (id: string): Promise<(Subject & { id: string }) | null> => {
  const doc = await subjectCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Subject>(doc);
};

export const addSubject = async (
  data: Omit<Subject, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await subjectCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Subject added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateSubject = async (id: string, data: Partial<Subject>): Promise<boolean> => {
  const docRef = subjectCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No subject found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated subject with ID: ${id}`);
  return true;
};

export const deleteSubject = async (id: string): Promise<boolean> => {
  const docRef = subjectCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No subject found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted subject with ID: ${id}`);
  return true;
};
