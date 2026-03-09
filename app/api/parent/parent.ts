import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Parent {
  f_name: string;
  l_name: string;
  dob: string;
  gender: string;
  occupation: string;
  relation: string;
  phone_num: string;
  student_ids: string[];
  created_at: string;
  updated_at: string;
}

const parentCollection = db.collection('parents');

export const getAllParents = async (): Promise<(Parent & { id: string })[]> => {
  const snapshot = await parentCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Parent>(snapshot.docs);
};

export const getParentById = async (id: string): Promise<(Parent & { id: string }) | null> => {
  const doc = await parentCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Parent>(doc);
};

export const addParent = async (data: Omit<Parent, 'created_at' | 'updated_at'>): Promise<string> => {
  const docRef = await parentCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Parent added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateParent = async (id: string, data: Partial<Parent>): Promise<boolean> => {
  const docRef = parentCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No parent found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated parent with ID: ${id}`);
  return true;
};

export const deleteParent = async (id: string): Promise<boolean> => {
  const docRef = parentCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No parent found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted parent with ID: ${id}`);
  return true;
};
