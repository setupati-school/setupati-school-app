import { Request, Response } from 'express';
import {
  getAllCirculars,
  getCircularById,
  addCircular,
  updateCircular,
  deleteCircular
} from '../../api/circular/circular.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import { sendCircularNotification } from '../../utils/emailService.js';
import { getRecipientEmails } from '../../utils/getRecipientEmails.js';
import logger from '../../utils/logger.js';

export const createCircular = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = await addCircular(data);

    // Send email notifications asynchronously (non-blocking)
    getRecipientEmails(data.targeted_group)
      .then((emails) => {
        if (emails.length > 0) {
          return sendCircularNotification(emails, {
            title: data.title,
            description: data.description,
            issued_by: data.issued_by,
            issued_date: data.issued_date,
            valid_until: data.valid_until,
            targeted_group: data.targeted_group,
            attachment_url: data.attachment_url ?? null
          });
        }
      })
      .catch((err) => logger.error('Failed to send circular notification emails:', err));

    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating circular:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getCircular = async (req: Request, res: Response) => {
  try {
    const { circular_id } = req.params;
    const circular = await getCircularById(circular_id);
    if (!circular) return res.status(404).json({ error: 'Circular not found' });
    res.status(200).json({ circular });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching circular:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllCircularsHandler = async (req: Request, res: Response) => {
  try {
    const circulars = await getAllCirculars();
    res.status(200).json({ circulars });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all circulars:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateCircularHandler = async (req: Request, res: Response) => {
  try {
    const { circular_id } = req.params;
    const updated = await updateCircular(circular_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Circular not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating circular:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteCircularHandler = async (req: Request, res: Response) => {
  try {
    const { circular_id } = req.params;
    const deleted = await deleteCircular(circular_id);
    if (!deleted) return res.status(404).json({ error: 'Circular not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting circular:', message);
    res.status(httpCode).json({ error: message });
  }
};
