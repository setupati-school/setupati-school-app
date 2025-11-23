import { db } from '../../firebase.js';
import type grade from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type Grade = typeof grade;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const gradeCollection = db.collection('grades');

export const addGrade = async (data: Grade): Promise<string> => {
  const docRef = await gradeCollection.add(data);
  logger.info(`Grade added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getGrade = async (
  gradeName: string
): Promise<{ id: string; grade: Grade | null }[]> => {
  const gradeDoc = await gradeCollection
    .where('grade_name', '==', gradeName)
    .get();
  if (gradeDoc.empty) {
    logger.info(`No grade found with ID: ${gradeName}`);
    return [{ id: '', grade: null }];
  }
  return mapDocsWithKey<Grade, 'grade'>(gradeDoc.docs, 'grade');
};

export const deleteGrade = async (gradeName: string): Promise<boolean> => {
  const gradeData = await getGrade(gradeName);
  if (!gradeData.length || gradeData[0].grade === null) {
    logger.info(`No grade found to delete with ID: ${gradeName}`);
    return false;
  }
  const deletePromises = gradeData.map(({ id }) => {
    logger.info(`Deleting grade with ID: ${id}`);
    return gradeCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(`Deleted ${gradeData.length} grade(s) with ID: ${gradeName}`);
  return true;
};

export const searchGrade = async (
  gradeName: string
): Promise<{ id: string; grade: Grade | null }[]> => {
  const snapshot = await gradeCollection
    .where('grade_name', '==', gradeName)
    .get();
  if (snapshot.empty) {
    logger.info(`No grades found with Name: ${gradeName}`);
    return [];
  }
  logger.info(`Grades found with Name: ${gradeName}`);
  return mapDocsWithKey<Grade, 'grade'>(snapshot.docs, 'grade');
};

export const getAllGradeDetails = async (): Promise<
  { id: string; grade: Grade | null }[]
> => {
  const snapshot = await gradeCollection.get();
  if (snapshot.empty) {
    logger.info(`No grades found in the database`);
    return [];
  }
  logger.info(`Fetched all grades from the database`);
  return mapDocsWithKey<Grade, 'grade'>(snapshot.docs, 'grade');
};

export const updateGrade = async (
  gradeName: string,
  data: Partial<Grade>
): Promise<boolean> => {
  logger.info(`Updating grade with ID: ${gradeName}`);
  const gradeData = await getGrade(gradeName);
  if (!gradeData.length || gradeData[0].grade === null) {
    logger.info(`No grade found to update with ID: ${gradeName}`);
    return false;
  }
  const updatePromises = gradeData.map(({ id }) => {
    const gradeRef = gradeCollection.doc(id);
    return gradeRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(`Updated ${gradeData.length} grade(s) with ID: ${gradeName}`);
  return true;
};
