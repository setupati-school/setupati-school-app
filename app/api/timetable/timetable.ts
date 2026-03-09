import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

interface Timetable {
  day_of_week: DayOfWeek;
  period: number;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

const timetableCollection = db.collection('timetables');

export const getAllTimetables = async (): Promise<(Timetable & { id: string })[]> => {
  const snapshot = await timetableCollection.get();
  if (snapshot.empty) return [];
  return docsToFlat<Timetable>(snapshot.docs);
};

export const getTimetableById = async (id: string): Promise<(Timetable & { id: string }) | null> => {
  const doc = await timetableCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<Timetable>(doc);
};

export const getTimetableBySection = async (
  sectionId: string
): Promise<(Timetable & { id: string })[]> => {
  const snapshot = await timetableCollection.where('section_id', '==', sectionId).get();
  if (snapshot.empty) return [];
  return docsToFlat<Timetable>(snapshot.docs);
};

export const addTimetable = async (
  data: Omit<Timetable, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await timetableCollection.add({ ...data, created_at: now(), updated_at: now() });
  logger.info(`Timetable added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateTimetable = async (id: string, data: Partial<Timetable>): Promise<boolean> => {
  const docRef = timetableCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No timetable found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated timetable with ID: ${id}`);
  return true;
};

export const deleteTimetable = async (id: string): Promise<boolean> => {
  const docRef = timetableCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No timetable found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted timetable with ID: ${id}`);
  return true;
};
