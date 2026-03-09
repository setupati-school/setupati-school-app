import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Section {
  section_name: string;
  grade_id: string;
  class_teacher_id: string;
  group_name: string;
  created_at: string;
  updated_at: string;
}

const sectionCollection = db.collection('sections');

export const getAllSections = async (): Promise<(Section & { id: string })[]> => {
  const snapshot = await sectionCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Section>(snapshot.docs);
};

export const getSectionById = async (id: string): Promise<(Section & { id: string }) | null> => {
  const doc = await sectionCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Section>(doc);
};

export const addSection = async (
  data: Omit<Section, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await sectionCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Section added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateSection = async (id: string, data: Partial<Section>): Promise<boolean> => {
  const docRef = sectionCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No section found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated section with ID: ${id}`);
  return true;
};

export const deleteSection = async (id: string): Promise<boolean> => {
  const docRef = sectionCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No section found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted section with ID: ${id}`);
  return true;
};
