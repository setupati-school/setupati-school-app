import { db, auth } from '../../firebase.js';
import { User } from '../../models/User.js';
import { AppError, HttpCode } from '../../Error/error.js';
import type { Student, Parent, Teacher } from '@setupati-school/setupati-types';
import logger from '../../utils/logger.js';

if (!db || !auth)
  throw new AppError(
    'Database or Auth connection not established successfully',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const userCollection = db.collection('users');
const studentCollection = db.collection('students');
const parentCollection = db.collection('parents');
const teacherCollection = db.collection('teachers');

const nowIso = () => new Date().toISOString();

export const createStudentAndParent = async (
  student: Student,
  parent: Parent,
  password: string
) => {
  const userRecord = await auth!.createUser({
    email: student.email,
    password: password,
    displayName: `${student.f_name} ${student.l_name}`
  });

  const uid = userRecord.uid;

  await auth!.setCustomUserClaims(uid, { role: 'student' });

  const userDoc = {
    email: student.email,
    name: `${student.f_name} ${student.l_name}`,
    role: 'student',
    is_active: false,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  const parentRef = parentCollection.doc();
  const parentId = parentRef.id;

  const studentDoc = {
    id: uid,
    ...student,
    parent_id: parentId,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  const parentDoc = {
    id: parentId,
    ...parent,
    student_id: [uid],
    created_at: nowIso(),
    updated_at: nowIso()
  };

  const batch = db!.batch();
  const userRef = userCollection.doc(uid);
  const studentRef = studentCollection.doc(uid);

  batch.set(userRef, userDoc);
  batch.set(studentRef, studentDoc);
  batch.set(parentRef, parentDoc);

  try {
    await batch.commit();
  } catch (err) {
    try {
      await auth!.deleteUser(uid);
    } catch (delErr) {
      logger.error(
        'Failed to delete auth user after Firestore commit failure.',
        delErr
      );
    }
    throw err;
  }

  return { uid, userDoc, studentDoc, parentDoc };
};

export const createTeacher = async (teacher: Teacher, password: string) => {
  const userRecord = await auth!.createUser({
    email: teacher.email,
    password: password,
    displayName: `${teacher.f_name} ${teacher.l_name}`
  });

  const uid = userRecord.uid;

  await auth!.setCustomUserClaims(uid, { role: 'teacher' });

  const userDoc = {
    email: teacher.email,
    name: `${teacher.f_name} ${teacher.l_name}`,
    role: 'teacher',
    is_active: false,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  const teacherDoc = {
    id: uid,
    ...teacher,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  const batch = db!.batch();
  const userRef = userCollection.doc(uid);
  const teacherRef = teacherCollection.doc(uid);
  batch.set(userRef, userDoc);
  batch.set(teacherRef, teacherDoc);

  try {
    await batch.commit();
  } catch (err) {
    try {
      await auth!.deleteUser(uid);
    } catch (delErr) {
      logger.error(
        'Failed to delete auth user after Firestore commit failure',
        delErr
      );
    }
    throw err;
  }

  return { uid, userDoc, teacherDoc };
};

export const addUser = async (data: User): Promise<string> => {
  const { name, email, password, role } = data;

  const userRecord = await auth!.createUser({
    email: email,
    password: password,
    displayName: name
  });

  await auth!.setCustomUserClaims(userRecord.uid, { role });

  const userDoc = {
    email: data.email,
    name: data.name,
    is_active: true,
    role: data.role,
    created_at: nowIso,
    updated_at: nowIso
  };

  await userCollection.doc(userRecord.uid).set(userDoc);
  return userRecord.uid;
};

export const getUserById = async (uid: string): Promise<User> => {
  const userRecord = await auth!.getUser(uid);
  const userDoc = await userCollection.doc(uid).get();
  if (!userDoc.exists) {
    throw new AppError('User data not found in database.', HttpCode.NOT_FOUND);
  }

  return { id: userRecord.uid, ...userDoc.data() } as User;
};

export const validateEmail = async (email: string): Promise<boolean> => {
  const userRecord = await auth!.getUserByEmail(email);
  if (!userRecord) {
    throw new AppError('User Email not found.', HttpCode.NOT_FOUND);
  }
  return true;
};

export const deleteUser = async (uid: string): Promise<void> => {
  const userRecord = await userCollection.doc(uid).get();
  if (!userRecord.exists)
    throw new AppError('User data not found.', HttpCode.NOT_FOUND);
  await userCollection.doc(uid).delete();
  await auth!.deleteUser(uid);
};
