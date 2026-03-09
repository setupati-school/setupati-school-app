import { getAllStudents } from '../api/student/student.js';
import { getAllTeachers } from '../api/teacher/teacher.js';
import { getAllParents } from '../api/parent/parent.js';
import logger from './logger.js';

type TargetedGroup = 'All' | 'Students' | 'Teachers' | 'Parents';

export const getRecipientEmails = async (targetedGroup: TargetedGroup): Promise<string[]> => {
  const emails: string[] = [];

  try {
    if (targetedGroup === 'Students' || targetedGroup === 'All') {
      const students = await getAllStudents();
      students.forEach((s) => { if (s.email) emails.push(s.email); });
    }

    if (targetedGroup === 'Teachers' || targetedGroup === 'All') {
      const teachers = await getAllTeachers();
      teachers.forEach((t) => { if (t.email) emails.push(t.email); });
    }

    if (targetedGroup === 'Parents' || targetedGroup === 'All') {
      // Parents don't have email — skip or extend Parent model if needed
    }

    const uniqueEmails = [...new Set(emails)];
    logger.info(`Found ${uniqueEmails.length} unique email(s) for group: ${targetedGroup}`);
    return uniqueEmails;
  } catch (error) {
    logger.error('Error fetching recipient emails:', error);
    return [];
  }
};
