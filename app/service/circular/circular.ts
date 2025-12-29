import { Request, Response } from 'express';
import logger from '../../utils/logger.js';
import {
  addCircular,
  deleteCircular,
  getAllCircularDetails,
  updateCircular,
  searchCircular as searchCircularApi
} from '../../api/circular/circular.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import { sendCircularNotification } from '../../utils/emailService.js';
import { getRecipientEmails } from '../../utils/getRecipientEmails.js';

interface CircularWithDates extends Record<string, unknown> {
  issued_date?: string;
  valid_until?: string;
}

export const createCircular = async (req: Request, res: Response) => {
  try {
    const data = req?.body || {};
    const id = await addCircular(data);

    // Send email notifications asynchronously (don't block the response)
    sendCircularEmail(data).catch((err) => {
      logger.error('Failed to send circular notification emails:', err);
    });

    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating circular:', message);
    res.status(httpCode).json({ error: message });
  }
};

const sendCircularEmail = async (circularData: CircularWithDates) => {
  const targetedGroup = circularData?.targeted_group as
    | 'All'
    | 'Students'
    | 'Teachers'
    | 'Parents';

  const emails = await getRecipientEmails(targetedGroup);

  if (emails.length === 0) {
    logger.info('No recipients found for circular notification');
    return;
  }

  await sendCircularNotification(emails, {
    title: String(circularData?.title || ''),
    description: String(circularData?.description || ''),
    issued_by: String(circularData?.issued_by || ''),
    issued_date: String(circularData?.issued_date || ''),
    valid_until: String(circularData?.valid_until || ''),
    targeted_group: targetedGroup,
    attachment_url: circularData?.attachment_url as string | null
  });
};

export const searchCircular = async (req: Request, res: Response) => {
  try {
    const { circular_id: circularId } = req?.params || {};
    const circulars = await searchCircularApi(circularId);
    res.status(200).json(circulars);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching for circulars:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteCircularDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { circular_id: circularId } = req?.params || {};
    const deleted = await deleteCircular(circularId);
    logger.info('deleted circular data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting circular details:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllCirculars = async (req: Request, res: Response) => {
  try {
    const rawCirculars = await getAllCircularDetails();

    const circulars = rawCirculars
      ?.filter((item) => item?.circular !== null)
      ?.map((item) => ({
        id: item?.id,
        ...(item?.circular as CircularWithDates)
      })) || [];

    circulars?.sort((a, b) => {
      const dateA = new Date(a?.issued_date || 0).getTime();
      const dateB = new Date(b?.issued_date || 0).getTime();
      return dateB - dateA;
    });

    res.status(200).json({ circulars });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all circulars:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateCircularDetails = async (req: Request, res: Response) => {
  try {
    const { circular_id: circularId } = req?.params || {};
    const data = req?.body || {};
    const updated = await updateCircular(circularId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating circular details:', message);
    res.status(httpCode).json({ error: message });
  }
};
