import { db } from '../../firebase.js';
import type subject from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from './../../utils/logger.js';
import { mapDocsWithKey, now } from '../../utils/helper.js';
type Subject = typeof subject;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const subjectCollection = db.collection('subjects');

export const addSubject = async (data: Subject): Promise<string> => {
  const subjectData = {
    ...data,
    created_at: now,
    updated_at: now
  };
  const docRef = await subjectCollection.add(subjectData);
  logger.info(`Subject added with ID: ${docRef?.id}`);
  return docRef.id;
};

export const getSubject = async (
  subjectId: string
): Promise<{ id: string; subject: Subject | null }[]> => {
  const subjectDoc = await subjectCollection
    .where('subject_id', '==', subjectId)
    .get();
  if (subjectDoc.empty) {
    logger.info(`No subjects found with ID: ${subjectId}`);
    return [{ id: '', subject: null }];
  }
  return mapDocsWithKey<Subject, 'subject'>(subjectDoc.docs, 'subject');
};

export const deleteSubject = async (subjectId: string): Promise<boolean> => {
  const docRef = subjectCollection.doc(subjectId);
  const doc = await docRef.get();

  if (!doc.exists) {
    logger.info(`No subject found to delete with ID: ${subjectId}`);
    return false;
  }

  await docRef.delete();
  logger.info(`Deleted subject with ID: ${subjectId}`);
  return true;
};

export const searchSubject = async (
  subjectId: string
): Promise<{ id: string; subject: Subject | null }[]> => {
  const snapshot = await subjectCollection
    .where('subject_id', '==', subjectId)
    .get();
  if (snapshot.empty) {
    logger.info(`No subject found with subject ID: ${subjectId}`);
    return [];
  }
  logger.info(
    `Subject data found:  ${JSON.stringify(snapshot.docs.map((doc) => doc.data()))}`
  );
  return mapDocsWithKey<Subject, 'subject'>(snapshot.docs, 'subject');
};

export const getAllSubjectDetails = async (): Promise<
  { id: string; subject: Subject | null }[]
> => {
  const snapshot = await subjectCollection.get();
  if (snapshot.empty) {
    logger.info('No subjects found in the database');
    return [];
  }
  logger.info(
    `All subject data found: ${JSON.stringify(snapshot.docs.map((doc) => doc.data()))}`
  );
  return mapDocsWithKey<Subject, 'subject'>(snapshot.docs, 'subject');
};

export const updateSubject = async (
  subjectId: string,
  data: Partial<Subject>
): Promise<boolean> => {
  logger.info(`Updating subject with ID: ${subjectId}`);

  const docRef = subjectCollection.doc(subjectId);
  const doc = await docRef.get();

  if (!doc.exists) {
    logger.info(`No subject found to update with ID: ${subjectId}`);
    return false;
  }

  const updateData = {
    ...data,
    updated_at: now
  };

  await docRef.update(updateData);
  logger.info(`Updated subject with ID: ${subjectId}`);
  return true;
};
