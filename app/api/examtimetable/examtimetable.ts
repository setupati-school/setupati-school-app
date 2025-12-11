import { db } from '../../firebase.js';
import type { ExamTimeTable } from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey, now } from '../../utils/helper.js';

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const examTimeTableCollection = db.collection('exam_timetables');

export const addExamTimeTable = async (
  data: ExamTimeTable
): Promise<string> => {
  const docRef = await examTimeTableCollection.add({
    ...data,
    id: data?.id || `exam_tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: data?.created_at || now,
    updated_at: now
  });
  logger.info(`ExamTimeTable added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getExamTimeTable = async (
  examTimeTableId: string
): Promise<{ id: string; examTimeTable: ExamTimeTable | null }[]> => {
  const examTimeTableDoc = await examTimeTableCollection
    .where('exam_time_table_id', '==', examTimeTableId)
    .get();
  if (examTimeTableDoc.empty) {
    logger.info(`No exam time table found with ID: ${examTimeTableId}`);
    return [{ id: '', examTimeTable: null }];
  }
  return mapDocsWithKey<ExamTimeTable, 'examTimeTable'>(
    examTimeTableDoc.docs,
    'examTimeTable'
  );
};

export const deleteExamTimeTable = async (
  examTimeTableId: string
): Promise<boolean> => {
  const examTimeTableData = await getExamTimeTable(examTimeTableId);
  if (
    !examTimeTableData.length ||
    examTimeTableData[0].examTimeTable === null
  ) {
    logger.info(
      `No exam time table found to delete with ID: ${examTimeTableId}`
    );
    return false;
  }
  const deletePromises = examTimeTableData.map(({ id }) => {
    logger.info(`Deleting exam time table with ID: ${id}`);
    return examTimeTableCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(
    `Deleted ${examTimeTableData.length} exam time table(s) with ID: ${examTimeTableId}`
  );
  return true;
};

export const searchExamTimeTable = async (
  examTimeTableId: string
): Promise<{ id: string; examTimeTable: ExamTimeTable | null }[]> => {
  const snapshot = await examTimeTableCollection
    .where('exam_time_table_id', '==', examTimeTableId)
    .get();
  if (snapshot.empty) {
    logger.info(`No exam time table found with ID: ${examTimeTableId}`);
    return [];
  }
  logger.info(`Exam time table found with ID: ${examTimeTableId}`);
  return mapDocsWithKey<ExamTimeTable, 'examTimeTable'>(
    snapshot.docs,
    'examTimeTable'
  );
};

export const getAllExamTimeTables = async (): Promise<
  { id: string; examTimeTable: ExamTimeTable | null }[]
> => {
  const snapshot = await examTimeTableCollection.get();
  if (snapshot.empty) {
    logger.info(`No exam time tables found in the database`);
    return [];
  }
  logger.info(`Fetched all exam time tables from the database`);
  return mapDocsWithKey<ExamTimeTable, 'examTimeTable'>(
    snapshot.docs,
    'examTimeTable'
  );
};

export const updateExamTimeTable = async (
  examTimeTableId: string,
  data: Partial<ExamTimeTable>
): Promise<boolean> => {
  logger.info(`Updating exam time table with ID: ${examTimeTableId}`);
  const examTimeTableData = await getExamTimeTable(examTimeTableId);
  if (
    !examTimeTableData?.length ||
    examTimeTableData?.[0]?.examTimeTable === null
  ) {
    logger.info(
      `No exam time table found to update with ID: ${examTimeTableId}`
    );
    return false;
  }
  const updatePromises = examTimeTableData?.map(({ id }) => {
    const examTimeTableRef = examTimeTableCollection.doc(id);
    return examTimeTableRef.update({
      ...data,
      updated_at: now
    });
  });
  await Promise.all(updatePromises);
  logger.info(
    `Updated ${examTimeTableData?.length} exam time table(s) with ID: ${examTimeTableId}`
  );
  return true;
};
