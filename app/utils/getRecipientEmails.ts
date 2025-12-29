import { getAllStudentDetails } from '../api/student/student.js';
import { getAllTeacherDetails } from '../api/teacher/teacher.js';
import { getAllParentDetails } from '../api/parent/parent.js';
import logger from './logger.js';

type TargetedGroup = 'All' | 'Students' | 'Teachers' | 'Parents';

interface UserWithEmail {
  email?: string;
}

export const getRecipientEmails = async (
  targetedGroup: TargetedGroup
): Promise<string[]> => {
  const emails: string[] = [];

  try {
    if (targetedGroup === 'Students' || targetedGroup === 'All') {
      const students = await getAllStudentDetails();
      students.forEach((item) => {
        const student = item.student as UserWithEmail | null;
        if (student?.email) {
          emails.push(student.email);
        }
      });
    }

    if (targetedGroup === 'Teachers' || targetedGroup === 'All') {
      const teachers = await getAllTeacherDetails();
      teachers.forEach((item) => {
        const teacher = item.teacher as UserWithEmail | null;
        if (teacher?.email) {
          emails.push(teacher.email);
        }
      });
    }

    if (targetedGroup === 'Parents' || targetedGroup === 'All') {
      const parents = await getAllParentDetails();
      parents.forEach((item) => {
        const parent = item.parent as UserWithEmail | null;
        if (parent?.email) {
          emails.push(parent.email);
        }
      });
    }

    const uniqueEmails = [...new Set(emails)];
    logger.info(
      `Found ${uniqueEmails.length} unique email(s) for group: ${targetedGroup}`
    );
    return uniqueEmails;
  } catch (error) {
    logger.error('Error fetching recipient emails:', error);
    return [];
  }
};
