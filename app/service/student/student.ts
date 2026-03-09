import { Request, Response } from 'express';
import {
  getAllStudents,
  getStudentById,
  getStudentsByRollNo,
  addStudent,
  updateStudent,
  deleteStudent
} from '../../api/student/student.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const id = await addStudent(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating student:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const searchStudentByRollNo = async (req: Request, res: Response) => {
  try {
    const { roll_no } = req.params;
    const students = await getStudentsByRollNo(roll_no);
    res.status(200).json({ students });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching students:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getStudent = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const student = await getStudentById(student_id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.status(200).json({ student });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching student:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllStudentsHandler = async (req: Request, res: Response) => {
  try {
    const students = await getAllStudents();
    res.status(200).json({ students });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all students:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateStudentHandler = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const updated = await updateStudent(student_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating student:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteStudentHandler = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const deleted = await deleteStudent(student_id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting student:', message);
    res.status(httpCode).json({ error: message });
  }
};
