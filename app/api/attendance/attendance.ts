import { db } from '../../firebase.js';
import type attendance from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type Attendance = typeof attendance;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const attendanceCollection = db.collection('attendance');

export const addAttendance = async (data: Attendance): Promise<string> => {
  const docRef = await attendanceCollection.add(data);
  logger.info(`Attendance added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getAttendance = async (
  attendanceId: string
): Promise<{ id: string; attendance: Attendance | null }[]> => {
  const attendanceDoc = await attendanceCollection
    .where('attendanceId', '==', attendanceId)
    .get();
  if (attendanceDoc.empty) {
    logger.info(`No attendance found for student ID: ${attendanceId}`);
    return [{ id: '', attendance: null }];
  }
  return mapDocsWithKey<Attendance, 'attendance'>(
    attendanceDoc.docs,
    'attendance'
  );
};

export const deleteAttendance = async (
  attendanceId: string
): Promise<boolean> => {
  const attendanceData = await getAttendance(attendanceId);
  if (!attendanceData.length || attendanceData[0].attendance === null) {
    logger.info(`No attendance found to delete with ID: ${attendanceId}`);
    return false;
  }
  const deletePromises = attendanceData.map(({ id }) => {
    logger.info(`Deleting attendance with ID: ${id}`);
    return attendanceCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(
    `Deleted ${attendanceData.length} attendance(s) with ID: ${attendanceId}`
  );
  return true;
};

export const searchAttendance = async (
  attendanceId: string
): Promise<{ id: string; attendance: Attendance | null }[]> => {
  const snapshot = await attendanceCollection
    .where('attendanceId', '==', attendanceId)
    .get();
  if (snapshot.empty) {
    logger.info(`No attendance found with ID: ${attendanceId}`);
    return [];
  }
  logger.info(`Attendance found with ID: ${attendanceId}`);
  return mapDocsWithKey<Attendance, 'attendance'>(snapshot.docs, 'attendance');
};

export const getAllAttendanceDetails = async (): Promise<
  { id: string; attendance: Attendance | null }[]
> => {
  const snapshot = await attendanceCollection.get();
  if (snapshot.empty) {
    logger.info(`No attendance found in the database`);
    return [];
  }
  logger.info(`Fetched all attendance from the database`);
  return mapDocsWithKey<Attendance, 'attendance'>(snapshot.docs, 'attendance');
};

export const updateAttendance = async (
  attendanceId: string,
  data: Partial<Attendance>
): Promise<boolean> => {
  logger.info(`Updating attendance with ID: ${attendanceId}`);
  const attendanceData = await getAttendance(attendanceId);
  if (!attendanceData.length || attendanceData[0].attendance === null) {
    logger.info(`No attendance found to update with ID: ${attendanceId}`);
    return false;
  }
  const updatePromises = attendanceData.map(({ id }) => {
    const attendanceRef = attendanceCollection.doc(id);
    return attendanceRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(
    `Updated ${attendanceData.length} attendance(s) with ID: ${attendanceId}`
  );
  return true;
};
