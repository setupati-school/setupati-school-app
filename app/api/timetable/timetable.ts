import { db } from '../../firebase.js';
import type timeTable from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type TimeTable = typeof timeTable;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const timeTableCollection = db.collection('timetables');

export const addTimeTable = async (data: TimeTable): Promise<string> => {
  const docRef = await timeTableCollection.add(data);
  logger.info(`TimeTable added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getTimeTable = async (
  timeTableId: string
): Promise<{ id: string; timeTable: TimeTable | null }[]> => {
  const timeTableDoc = await timeTableCollection
    .where('time_table_id', '==', timeTableId)
    .get();
  if (timeTableDoc.empty) {
    logger.info(`No time table found with ID: ${timeTableId}`);
    return [{ id: '', timeTable: null }];
  }
  return mapDocsWithKey<TimeTable, 'timeTable'>(timeTableDoc.docs, 'timeTable');
};

export const deleteTimeTable = async (
  timeTableId: string
): Promise<boolean> => {
  const timeTableData = await getTimeTable(timeTableId);
  if (!timeTableData.length || timeTableData[0].timeTable === null) {
    logger.info(`No time table found to delete with ID: ${timeTableId}`);
    return false;
  }
  const deletePromises = timeTableData.map(({ id }) => {
    logger.info(`Deleting time table with ID: ${id}`);
    return timeTableCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(
    `Deleted ${timeTableData.length} time table(s) with ID: ${timeTableId}`
  );
  return true;
};

export const searchTimeTable = async (
  timeTableId: string
): Promise<{ id: string; timeTable: TimeTable | null }[]> => {
  const snapshot = await timeTableCollection
    .where('time_table_id', '==', timeTableId)
    .get();
  if (snapshot.empty) {
    logger.info(`No time table found with ID: ${timeTableId}`);
    return [];
  }
  logger.info(`Time table found with ID: ${timeTableId}`);
  return mapDocsWithKey<TimeTable, 'timeTable'>(snapshot.docs, 'timeTable');
};

export const getAllTimeTables = async (): Promise<
  { id: string; timeTable: TimeTable | null }[]
> => {
  const snapshot = await timeTableCollection.get();
  if (snapshot.empty) {
    logger.info(`No time tables found in the database`);
    return [];
  }
  logger.info(`Fetched all time tables from the database`);
  return mapDocsWithKey<TimeTable, 'timeTable'>(snapshot.docs, 'timeTable');
};

export const updateTimeTable = async (
  timeTableId: string,
  data: Partial<TimeTable>
): Promise<boolean> => {
  logger.info(`Updating time table with ID: ${timeTableId}`);
  const timeTableData = await getTimeTable(timeTableId);
  if (!timeTableData.length || timeTableData[0].timeTable === null) {
    logger.info(`No time table found to update with ID: ${timeTableId}`);
    return false;
  }
  const updatePromises = timeTableData.map(({ id }) => {
    const timeTableRef = timeTableCollection.doc(id);
    return timeTableRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(
    `Updated ${timeTableData.length} time table(s) with ID: ${timeTableId}`
  );
  return true;
};
