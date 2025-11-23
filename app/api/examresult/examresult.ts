import { db } from '../../firebase.js';
import type examResult from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type ExamResult = typeof examResult;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const examResultCollection = db.collection('exam_results');

export const addExamResult = async (data: ExamResult): Promise<string> => {
  const docRef = await examResultCollection.add(data);
  logger.info(`ExamResult added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getExamResult = async (
  examResultId: string
): Promise<{ id: string; examResult: ExamResult | null }[]> => {
  const examResultDoc = await examResultCollection
    .where('exam_result_id', '==', examResultId)
    .get();
  if (examResultDoc.empty) {
    logger.info(`No exam result found with ID: ${examResultId}`);
    return [{ id: '', examResult: null }];
  }
  return mapDocsWithKey<ExamResult, 'examResult'>(
    examResultDoc.docs,
    'examResult'
  );
};

export const deleteExamResult = async (
  examResultId: string
): Promise<boolean> => {
  const examResultData = await getExamResult(examResultId);
  if (!examResultData.length || examResultData[0].examResult === null) {
    logger.info(`No exam result found to delete with ID: ${examResultId}`);
    return false;
  }
  const deletePromises = examResultData.map(({ id }) => {
    logger.info(`Deleting exam result with ID: ${id}`);
    return examResultCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(
    `Deleted ${examResultData.length} exam result(s) with ID: ${examResultId}`
  );
  return true;
};

export const searchExamResult = async (
  examResultId: string
): Promise<{ id: string; examResult: ExamResult | null }[]> => {
  const snapshot = await examResultCollection
    .where('exam_result_id', '==', examResultId)
    .get();
  if (snapshot.empty) {
    logger.info(`No exam result found with ID: ${examResultId}`);
    return [];
  }
  logger.info(`Exam result found with ID: ${examResultId}`);
  return mapDocsWithKey<ExamResult, 'examResult'>(snapshot.docs, 'examResult');
};

export const getAllExamResults = async (): Promise<
  { id: string; examResult: ExamResult | null }[]
> => {
  const snapshot = await examResultCollection.get();
  if (snapshot.empty) {
    logger.info(`No exam results found in the database`);
    return [];
  }
  logger.info(`Fetched all exam results from the database`);
  return mapDocsWithKey<ExamResult, 'examResult'>(snapshot.docs, 'examResult');
};

export const updateExamResult = async (
  examResultId: string,
  data: Partial<ExamResult>
): Promise<boolean> => {
  logger.info(`Updating exam result with ID: ${examResultId}`);
  const examResultData = await getExamResult(examResultId);
  if (!examResultData.length || examResultData[0].examResult === null) {
    logger.info(`No exam result found to update with ID: ${examResultId}`);
    return false;
  }
  const updatePromises = examResultData.map(({ id }) => {
    const examResultRef = examResultCollection.doc(id);
    return examResultRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(
    `Updated ${examResultData.length} exam result(s) with ID: ${examResultId}`
  );
  return true;
};
