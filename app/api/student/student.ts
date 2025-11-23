import { db } from '../../firebase.js';
import type student from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from './../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type Student = typeof student;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const studentCollection = db.collection('students');

export const addStudent = async (data: Student): Promise<string> => {
  const docRef = await studentCollection.add(data);
  logger.info(`Student added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getStudent = async (
  studentRollNo: string
): Promise<{ id: string; student: Student | null }[]> => {
  const studentDoc = await studentCollection
    .where('roll_no', '==', studentRollNo)
    .get();
  if (studentDoc.empty) {
    return [{ id: '', student: null }];
  }
  return mapDocsWithKey<Student, 'student'>(studentDoc.docs, 'student');
};

export const deleteStudent = async (
  studentRollNo: string
): Promise<boolean> => {
  const studentData = await getStudent(studentRollNo);
  if (!studentData.length || studentData[0].student === null) {
    logger.info(`No students found with roll number: ${studentRollNo}`);
    return false;
  }
  const deletePromises = studentData.map(({ id }) => {
    logger.info(`Deleting student with ID: ${id}`);
    return studentCollection.doc(id).delete();
  });
  await Promise.all(deletePromises);
  logger.info(
    `Deleted ${studentData.length} student(s) with roll number: ${studentRollNo}`
  );
  return true;
};

export const searchStudent = async (
  studentRollNo: string
): Promise<{ id: string; student: Student | null }[]> => {
  const snapshot = await studentCollection
    .where('roll_no', '==', studentRollNo)
    .get();
  if (snapshot.empty) {
    return [];
  }
  logger.info(
    `Student data found:  ${JSON.stringify(snapshot.docs.map((doc) => doc.data()))}`
  );
  return mapDocsWithKey<Student, 'student'>(snapshot.docs, 'student');
};

export const getAllStudentDetails = async (): Promise<
  { id: string; student: Student | null }[]
> => {
  const snapshot = await studentCollection.get();
  if (snapshot.empty) {
    return [];
  }
  logger.info(
    `All student data found: ${JSON.stringify(snapshot.docs.map((doc) => doc.data()))}`
  );
  return mapDocsWithKey<Student, 'student'>(snapshot.docs, 'student');
};

export const updateStudent = async (
  studentRollNo: string,
  data: Partial<Student>
): Promise<boolean> => {
  const studentData = await getStudent(studentRollNo);
  if (!studentData.length || studentData[0].student === null) {
    logger.info(`No students found with roll number: ${studentRollNo}`);
    return false;
  }
  const updatePromises = studentData.map(({ id }) => {
    const studentRef = studentCollection.doc(id);
    return studentRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(
    `Updated ${studentData.length} student(s) with roll number: ${studentRollNo}`
  );
  return true;
};
