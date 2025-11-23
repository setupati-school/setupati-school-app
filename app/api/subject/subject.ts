import { db } from '../../firebase.js';
import type subject from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from './../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type Subject = typeof subject;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const subjectCollection = db.collection('subjects');

export const addSubject = async (data: Subject): Promise<string> => {
  const docRef = await subjectCollection.add(data);
  logger.info(`Subject added with ID: ${docRef.id}`);
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
  const subjectData = await getSubject(subjectId);
  if (!subjectData.length || subjectData[0].subject === null) {
    logger.info(`No subjects found with ID: ${subjectId}`);
    return false;
  }
  const deletePromises = subjectData.map(({ id }) => {
    logger.info(`Deleting subject with ID: ${id}`);
    return subjectCollection.doc(id).delete();
  });
  await Promise.all(deletePromises);
  logger.info(`Deleted ${subjectData.length} subject(s) with ID: ${subjectId}`);
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
  const subjectData = await getSubject(subjectId);
  if (!subjectData.length || subjectData[0].subject === null) {
    logger.info(`No subjects found with subject ID: ${subjectId}`);
    return false;
  }
  const updatePromises = subjectData.map(({ id }) => {
    const subjectRef = subjectCollection.doc(id);
    return subjectRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(`Updated ${subjectData.length} subject(s) with ID: ${subjectId}`);
  return true;
};
