import { Request, Response } from 'express';
import {
  addStudent,
  deleteStudent,
  getAllStudentDetails,
  searchStudent as searchStudentApi,
  updateStudent
} from '../../api/student/student.js';
import type student from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
type Student = typeof student;

export const createStudent = async (
  req: Request<{ Student: Student }>,
  res: Response
) => {
  try {
    const data = req?.body;
    const id = await addStudent(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchStudent = async (
  req: Request<{ student_rollno: string }>,
  res: Response
) => {
  try {
    const { student_rollno: studentRollNo } = req?.params || {};
    if (!studentRollNo) {
      return res.status(400).json({ error: 'Student roll number is required' });
    }
    const students = await searchStudentApi(studentRollNo);
    res.status(200).json(students);
  } catch (error) {
    logger.error('Error searching for students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteStudentDetails = async (
  req: Request<{ student_rollno: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { student_rollno: studentRollNo } = req?.params || {};
    if (!studentRollNo) {
      return res.status(400).json({ error: 'Student roll number is required' });
    }
    const deleted = await deleteStudent(studentRollNo);
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting student details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await getAllStudentDetails();
    res.status(200).json(students);
  } catch (error) {
    logger.error('Error fetching all students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateStudentDetails = async (
  req: Request<{ student_rollno: string; Student: Partial<Student> }>,
  res: Response
) => {
  try {
    const { student_rollno: studentRollNo } = req?.params || {};
    const data = req?.body;
    if (!studentRollNo) {
      return res.status(400).json({ error: 'Student roll number is required' });
    }
    const updated = await updateStudent(studentRollNo, data);
    if (!updated) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating student details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
