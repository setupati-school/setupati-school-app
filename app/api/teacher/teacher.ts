import { db } from '../../firebase.js';
import type teacher from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type Teacher = typeof teacher;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const teacherCollection = db.collection('teachers');

export const addTeacher = async (data: Teacher): Promise<string> => {
  const docRef = await teacherCollection.add(data);
  logger.info(`Teacher added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getTeacher = async (
  teacherId: string
): Promise<{ id: string; teacher: Teacher | null }[]> => {
  const teacherDoc = await teacherCollection
    .where('teacher_id', '==', teacherId)
    .get();
  if (teacherDoc.empty) {
    logger.info(`No teacher found with ID: ${teacherId}`);
    return [{ id: '', teacher: null }];
  }
  return mapDocsWithKey<Teacher, 'teacher'>(teacherDoc.docs, 'teacher');
};

export const deleteTeacher = async (teacherId: string): Promise<boolean> => {
  const teacherData = await getTeacher(teacherId);
  if (!teacherData.length || teacherData[0].teacher === null) {
    logger.info(`No teacher found to delete with ID: ${teacherId}`);
    return false;
  }
  const deletePromises = teacherData.map(({ id }) => {
    logger.info(`Deleting teacher with ID: ${id}`);
    return teacherCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(`Deleted ${teacherData.length} teacher(s) with ID: ${teacherId}`);
  return true;
};

export const searchTeacher = async (
  teacherId: string
): Promise<{ id: string; teacher: Teacher | null }[]> => {
  const snapshot = await teacherCollection
    .where('teacher_id', '==', teacherId)
    .get();
  if (snapshot.empty) {
    logger.info(`No teachers found with ID: ${teacherId}`);
    return [];
  }
  logger.info(`Teachers found with ID: ${teacherId}`);
  return mapDocsWithKey<Teacher, 'teacher'>(snapshot.docs, 'teacher');
};

export const getAllTeacherDetails = async (): Promise<
  { id: string; teacher: Teacher | null }[]
> => {
  const snapshot = await teacherCollection.get();
  if (snapshot.empty) {
    logger.info(`No teachers found in the database`);
    return [];
  }
  logger.info(`Fetched all teachers from the database`);
  return mapDocsWithKey<Teacher, 'teacher'>(snapshot.docs, 'teacher');
};

export const updateTeacher = async (
  teacherId: string,
  data: Partial<Teacher>
): Promise<boolean> => {
  logger.info(`Updating teacher with ID: ${teacherId}`);
  const teacherData = await getTeacher(teacherId);
  if (!teacherData.length || teacherData[0].teacher === null) {
    logger.info(`No teacher found to update with ID: ${teacherId}`);
    return false;
  }
  const updatePromises = teacherData.map(({ id }) => {
    const teacherRef = teacherCollection.doc(id);
    return teacherRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(`Updated ${teacherData.length} teacher(s) with ID: ${teacherId}`);
  return true;
};
