import { db } from '../../firebase.js';
import type circular from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type Circular = typeof circular;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const circularCollection = db.collection('circulars');

export const addCircular = async (data: Circular): Promise<string> => {
  const now = new Date().toISOString();
  const circularData = {
    ...data,
    created_at: now,
    updated_at: now
  };
  const docRef = await circularCollection.add(circularData);
  logger.info(`Circular added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getCircular = async (
  circularId: string
): Promise<{ id: string; circular: Circular | null }[]> => {
  const circularDoc = await circularCollection
    .where('circular_id', '==', circularId)
    .get();
  if (circularDoc.empty) {
    logger.info(`No circular found with ID: ${circularId}`);
    return [{ id: '', circular: null }];
  }
  return mapDocsWithKey<Circular, 'circular'>(circularDoc.docs, 'circular');
};

export const deleteCircular = async (circularId: string): Promise<boolean> => {
  const docRef = circularCollection.doc(circularId);
  const doc = await docRef.get();

  if (!doc.exists) {
    logger.info(`No circular found to delete with ID: ${circularId}`);
    return false;
  }

  await docRef.delete();
  logger.info(`Deleted circular with ID: ${circularId}`);
  return true;
};

export const searchCircular = async (
  circularId: string
): Promise<{ id: string; circular: Circular | null }[]> => {
  const snapshot = await circularCollection
    .where('circular_id', '==', circularId)
    .get();
  if (snapshot.empty) {
    logger.info(`No circular found with ID: ${circularId}`);
    return [];
  }
  logger.info(`Circular found with ID: ${circularId}`);
  return mapDocsWithKey<Circular, 'circular'>(snapshot.docs, 'circular');
};

export const getAllCircularDetails = async (): Promise<
  { id: string; circular: Circular | null }[]
> => {
  const snapshot = await circularCollection.get();
  if (snapshot.empty) {
    logger.info(`No circular found in the database`);
    return [];
  }
  logger.info(`Fetched all circular from the database`);
  return mapDocsWithKey<Circular, 'circular'>(snapshot.docs, 'circular');
};

export const updateCircular = async (
  circularId: string,
  data: Partial<Circular>
): Promise<boolean> => {
  logger.info(`Updating circular with ID: ${circularId}`);

  const docRef = circularCollection.doc(circularId);
  const doc = await docRef.get();

  if (!doc.exists) {
    logger.info(`No circular found to update with ID: ${circularId}`);
    return false;
  }

  const updateData = {
    ...data,
    updated_at: new Date().toISOString()
  };

  await docRef.update(updateData);
  logger.info(`Updated circular with ID: ${circularId}`);
  return true;
};
