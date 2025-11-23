import { db } from '../../firebase.js';
import type circular from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
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
  const docRef = await circularCollection.add(data);
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
  const circularData = await getCircular(circularId);
  if (!circularData.length || circularData[0].circular === null) {
    logger.info(`No circular found to delete with ID: ${circularId}`);
    return false;
  }
  const deletePromises = circularData.map(({ id }) => {
    logger.info(`Deleting circular with ID: ${id}`);
    return circularCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(
    `Deleted ${circularData.length} circular(s) with ID: ${circularId}`
  );
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
  const circularData = await getCircular(circularId);
  if (!circularData.length || circularData[0].circular === null) {
    logger.info(`No circular found to update with ID: ${circularId}`);
    return false;
  }
  const updatePromises = circularData.map(({ id }) => {
    const circularRef = circularCollection.doc(id);
    return circularRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(
    `Updated ${circularData.length} circular(s) with ID: ${circularId}`
  );
  return true;
};
