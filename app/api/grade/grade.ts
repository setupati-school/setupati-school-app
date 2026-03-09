import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Grade {
  grade_name: string;
  created_at: string;
  updated_at: string;
}

const gradeCollection = db.collection('grades');

export const getAllGrades = async (): Promise<(Grade & { id: string })[]> => {
  const snapshot = await gradeCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Grade>(snapshot.docs);
};

export const getGradeById = async (id: string): Promise<(Grade & { id: string }) | null> => {
  const doc = await gradeCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Grade>(doc);
};

export const addGrade = async (data: { grade_name: string }): Promise<string> => {
  const docRef = await gradeCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Grade added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateGrade = async (id: string, data: Partial<Grade>): Promise<boolean> => {
  const docRef = gradeCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No grade found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated grade with ID: ${id}`);
  return true;
};

export const deleteGrade = async (id: string): Promise<boolean> => {
  const docRef = gradeCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No grade found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted grade with ID: ${id}`);
  return true;
};
