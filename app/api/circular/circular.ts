import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

interface Circular {
  title: string;
  description: string;
  issued_by: string;
  issued_date: string;
  valid_until: string;
  targeted_group: 'All' | 'Students' | 'Teachers' | 'Parents';
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
}

const circularCollection = db.collection('circulars');

export const getAllCirculars = async (): Promise<(Circular & { id: string })[]> => {
  const snapshot = await circularCollection.orderBy('issued_date', 'desc').get();
  if (snapshot.empty) return [];
  return docsToFlat<Circular>(snapshot.docs);
};

export const getCircularById = async (id: string): Promise<(Circular & { id: string }) | null> => {
  const doc = await circularCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Circular>(doc);
};

export const addCircular = async (
  data: Omit<Circular, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await circularCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Circular added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateCircular = async (id: string, data: Partial<Circular>): Promise<boolean> => {
  const docRef = circularCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No circular found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated circular with ID: ${id}`);
  return true;
};

export const deleteCircular = async (id: string): Promise<boolean> => {
  const docRef = circularCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No circular found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted circular with ID: ${id}`);
  return true;
};
