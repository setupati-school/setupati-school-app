import { db } from '../../firebase.js';
import type section from '@setupati-school/setupati-types/models';
import { AppError, HttpCode } from '../../error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey } from '../../utils/helper.js';
type Section = typeof section;

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const sectionCollection = db.collection('sections');

export const addSection = async (data: Section): Promise<string> => {
  const docRef = await sectionCollection.add(data);
  logger.info(`Section added with ID: ${docRef.id}`);
  return docRef.id;
};

export const getSection = async (
  sectionId: string
): Promise<{ id: string; section: Section | null }[]> => {
  const sectionDoc = await sectionCollection
    .where('section_id', '==', sectionId)
    .get();
  if (sectionDoc.empty) {
    logger.info(`No section found with ID: ${sectionId}`);
    return [{ id: '', section: null }];
  }
  return mapDocsWithKey<Section, 'section'>(sectionDoc.docs, 'section');
};

export const deleteSection = async (sectionId: string): Promise<boolean> => {
  const sectionData = await getSection(sectionId);
  if (!sectionData.length || sectionData[0].section === null) {
    logger.info(`No section found to delete with ID: ${sectionId}`);
    return false;
  }
  const deletePromises = sectionData.map(({ id }) => {
    logger.info(`Deleting section with ID: ${id}`);
    return sectionCollection.doc(id).delete();
  });

  await Promise.all(deletePromises);
  logger.info(`Deleted ${sectionData.length} section(s) with ID: ${sectionId}`);
  return true;
};

export const searchSection = async (
  sectionId: string
): Promise<{ id: string; section: Section | null }[]> => {
  const snapshot = await sectionCollection
    .where('section_id', '==', sectionId)
    .get();
  if (snapshot.empty) {
    logger.info(`No sections found with ID: ${sectionId}`);
    return [];
  }
  logger.info(`Sections found with ID: ${sectionId}`);
  return mapDocsWithKey<Section, 'section'>(snapshot.docs, 'section');
};

export const getAllSectionDetails = async (): Promise<
  { id: string; section: Section | null }[]
> => {
  const snapshot = await sectionCollection.get();
  if (snapshot.empty) {
    logger.info(`No sections found in the database`);
    return [];
  }
  logger.info(`Fetched all sections from the database`);
  return mapDocsWithKey<Section, 'section'>(snapshot.docs, 'section');
};

export const updateSection = async (
  sectionId: string,
  data: Partial<Section>
): Promise<boolean> => {
  logger.info(`Updating section with ID: ${sectionId}`);
  const sectionData = await getSection(sectionId);
  if (!sectionData.length || sectionData[0].section === null) {
    logger.info(`No section found to update with ID: ${sectionId}`);
    return false;
  }
  const updatePromises = sectionData.map(({ id }) => {
    const sectionRef = sectionCollection.doc(id);
    return sectionRef.update(data);
  });
  await Promise.all(updatePromises);
  logger.info(`Updated ${sectionData.length} section(s) with ID: ${sectionId}`);
  return true;
};
