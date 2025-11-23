import { db } from '../../firebase.js';
import type parent from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';

type Parent = typeof parent;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const parentCollection = db.collection('parents');

export const addParent = async (data: Parent): Promise<string> => {
  const docRef = await parentCollection.add(data);
  logger.info(`Parent added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getParent = async (
  parentId: string
): Promise<{ id: string; parent: Parent | null }[]> => {
  const parentDoc = await parentCollection
    .where('parent_id', '==', parentId)
    .get();
  if (parentDoc.empty) {
    logger.info(`No parent found with ID: ${parentId}`);
    return [{ id: '', parent: null }];
  }
  return mapDocsWithKey<Parent, 'parent'>(parentDoc.docs, 'parent');
};

export const deleteParent = async (parentId: string): Promise<boolean> => {
  const parentData = await getParent(parentId);
  if (!parentData.length || parentData[0].parent === null) {
    logger.info(`No parent found to delete with ID: ${parentId}`);
    return false;
  }
  const deletePromises = parentData.map(({ id }) => {
    logger.info(`Deleting parent with ID: ${id}`);
    return parentCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(`Deleted ${parentData.length} parent(s) with ID: ${parentId}`);
  return true;
};

export const searchParent = async (
  parentId: string
): Promise<{ id: string; parent: Parent | null }[]> => {
  const snapshot = await parentCollection
    .where('parent_id', '==', parentId)
    .get();
  if (snapshot.empty) {
    logger.info(`No parents found with ID: ${parentId}`);
    return [];
  }
  logger.info(`Parents found with ID: ${parentId}`);
  return mapDocsWithKey<Parent, 'parent'>(snapshot.docs, 'parent');
};

export const getAllParentDetails = async (): Promise<
  { id: string; parent: Parent | null }[]
> => {
  const snapshot = await parentCollection.get();
  if (snapshot.empty) {
    logger.info(`No parents found in the database`);
    return [];
  }
  logger.info(`Fetched all parents from the database`);
  return mapDocsWithKey<Parent, 'parent'>(snapshot.docs, 'parent');
};

export const updateParent = async (
  parentId: string,
  data: Partial<Parent>
): Promise<boolean> => {
  logger.info(`Updating parent with ID: ${parentId}`);
  const parentData = await getParent(parentId);
  if (!parentData.length || parentData[0].parent === null) {
    logger.info(`No parent found to update with ID: ${parentId}`);
    return false;
  }
  const updatePromises = parentData.map(({ id }) => {
    const parentRef = parentCollection.doc(id);
    return parentRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(`Updated ${parentData.length} parent(s) with ID: ${parentId}`);
  return true;
};
