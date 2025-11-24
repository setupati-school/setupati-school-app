import { Request, Response } from 'express';
import {
  addUser,
  deleteUser as deleteUserApi,
  getUserById as getUserByIdApi,
  validateEmail as validateEmailApi,
  createStudentAndParent as createStudentAndParentApi,
  createTeacher as createTeacherApi
} from '../../api/auth/auth.js';
import { User } from '../../models/User.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import {
  StudentSchemaPayload,
  TeacherSchemaPayload,
  validateEmailSchemaPayload,
  getUserSchemaPayload,
  deleteUserSchemaPayload
} from '../../zod/authSchema.js';
import logger from '../../utils/logger.js';

export const createStudentAndParent = async (req: Request, res: Response) => {
  try {
    const { student, parent, password } = req?.body as StudentSchemaPayload;

    const result = await createStudentAndParentApi(student, parent, password);

    logger.info(
      'user account created for Student and Parent with UID: ',
      result.uid
    );

    res.status(201).json({
      message: 'Student account created',
      uid: result.uid,
      user: result.userDoc,
      student: result.studentDoc,
      parent: result.parentDoc
    });
  } catch (err) {
    const { httpCode, message } = firebaseErrorParser(err);
    logger.error(
      `Error in creating the user account for the Student and Parent : ${message}`
    );
    res.status(httpCode).json({ error: message });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { teacher, password } = req?.body as TeacherSchemaPayload;

    const result = await createTeacherApi(teacher, password);

    logger.info('User account created for Teacher with UID: ', result.uid);

    res.status(201).json({
      message: 'Teacher account created',
      uid: result.uid,
      user: result.userDoc,
      teacher: result.teacherDoc
    });
  } catch (err) {
    const { httpCode, message } = firebaseErrorParser(err);
    logger.error(
      `Error in creating the user account for the Teacher : ${message}`
    );
    res.status(httpCode).json({ error: message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const data = req?.body;
    const { name, email, password, role } = data;

    const requiredFields = [
      { key: 'name', value: name },
      { key: 'email', value: email },
      { key: 'password', value: password },
      { key: 'role', value: role }
    ];

    const missingFields = requiredFields
      .filter((field) => !field.value || field.value.trim() === '')
      .map((field) => field.key);

    if (missingFields.length > 0) {
      const message =
        missingFields.length === requiredFields.length
          ? 'All fields are required'
          : `Please enter the missing fields: ${missingFields.join(', ')}`;

      return res.status(400).json({ error: message });
    }

    const id = await addUser(data);

    res.status(201).json({ id, message: 'User created successfully' });
  } catch (err) {
    logger.error('Error in creating account : ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { uid } = req?.params as getUserSchemaPayload;
    const user: User = await getUserByIdApi(uid);
    res.status(200).json({ user: user });
  } catch (err) {
    const { httpCode, message } = firebaseErrorParser(err);
    logger.error(`Error in fetching user : ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

export const validateEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req?.body as validateEmailSchemaPayload;
    const isValid = await validateEmailApi(email);
    res.status(200).json({ isValid: isValid });
  } catch (err) {
    const { httpCode, message } = firebaseErrorParser(err);
    logger.error(`Error in validating the emailID : ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { uid } = req?.params as deleteUserSchemaPayload;
    await deleteUserApi(uid);
    res.status(204).json({ message: 'User deleted successfully' });
  } catch (err) {
    const { httpCode, message } = firebaseErrorParser(err);
    logger.error(`Error in deleting the user: ${message}`);
    res.status(httpCode).json({ error: message });
  }
};
