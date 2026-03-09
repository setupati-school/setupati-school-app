import { db, auth } from '../../firebase.js';
import { User } from '../../models/User.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { now } from '../../utils/helper.js';

if (!db || !auth)
  throw new AppError(
    'Database or Auth connection not established successfully',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const userCollection = db.collection('users');
const studentCollection = db.collection('students');
const parentCollection = db.collection('parents');
const teacherCollection = db.collection('teachers');

interface StudentInput {
  f_name: string;
  l_name: string;
  email: string;
  roll_no: string;
  grade_id: string;
  section_id: string;
  dob: string;
  gender: string;
  phone_num: string;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  blood_group: string;
  aadhar_no: string;
}

interface ParentInput {
  f_name: string;
  l_name: string;
  dob: string;
  gender: string;
  occupation: string;
  relation: string;
  phone_num: string;
}

interface TeacherInput {
  f_name: string;
  l_name: string;
  email: string;
  designation: string;
  dob: string;
  doj: string;
  experienced_years: number;
  gender: string;
  qualification: string;
  phone_num: string;
}

export const createStudentAndParent = async (
  student: StudentInput,
  parent: ParentInput,
  password: string
) => {
  const userRecord = await auth!.createUser({
    email: student.email,
    password,
    displayName: `${student.f_name} ${student.l_name}`
  });

  const uid = userRecord.uid;
  await auth!.setCustomUserClaims(uid, { role: 'student' });

  const parentRef = parentCollection.doc();
  const parentId = parentRef.id;

  const userDoc = {
    email: student.email,
    name: `${student.f_name} ${student.l_name}`,
    role: 'student',
    is_active: false,
    created_at: now(),
    updated_at: now()
  };

  const studentDoc = {
    ...student,
    parent_id: parentId,
    created_at: now(),
    updated_at: now()
  };

  const parentDoc = {
    ...parent,
    student_ids: [uid],
    created_at: now(),
    updated_at: now()
  };

  const batch = db!.batch();
  batch.set(userCollection.doc(uid), userDoc);
  batch.set(studentCollection.doc(uid), studentDoc);
  batch.set(parentRef, parentDoc);

  try {
    await batch.commit();
  } catch (err) {
    try {
      await auth!.deleteUser(uid);
    } catch (delErr) {
      logger.error('Failed to delete auth user after Firestore commit failure.', delErr);
    }
    throw err;
  }

  return { uid, userDoc, studentDoc, parentDoc };
};

export const createTeacher = async (teacher: TeacherInput, password: string) => {
  const userRecord = await auth!.createUser({
    email: teacher.email,
    password,
    displayName: `${teacher.f_name} ${teacher.l_name}`
  });

  const uid = userRecord.uid;
  await auth!.setCustomUserClaims(uid, { role: 'teacher' });

  const userDoc = {
    email: teacher.email,
    name: `${teacher.f_name} ${teacher.l_name}`,
    role: 'teacher',
    is_active: false,
    created_at: now(),
    updated_at: now()
  };

  const teacherDoc = {
    ...teacher,
    created_at: now(),
    updated_at: now()
  };

  const batch = db!.batch();
  batch.set(userCollection.doc(uid), userDoc);
  batch.set(teacherCollection.doc(uid), teacherDoc);

  try {
    await batch.commit();
  } catch (err) {
    try {
      await auth!.deleteUser(uid);
    } catch (delErr) {
      logger.error('Failed to delete auth user after Firestore commit failure.', delErr);
    }
    throw err;
  }

  return { uid, userDoc, teacherDoc };
};

export const addUser = async (data: User): Promise<string> => {
  const { name, email, password, role } = data;

  const userRecord = await auth!.createUser({ email, password, displayName: name });
  await auth!.setCustomUserClaims(userRecord.uid, { role });

  const userDoc = {
    email,
    name,
    role,
    is_active: true,
    created_at: now(),
    updated_at: now()
  };

  await userCollection.doc(userRecord.uid).set(userDoc);
  return userRecord.uid;
};

export const getUserById = async (uid: string): Promise<User> => {
  const userDoc = await userCollection.doc(uid).get();
  if (!userDoc.exists) {
    throw new AppError('User data not found in database.', HttpCode.NOT_FOUND);
  }
  return { id: uid, ...userDoc.data() } as User;
};

export const validateEmail = async (email: string): Promise<boolean> => {
  const userRecord = await auth!.getUserByEmail(email);
  if (!userRecord) throw new AppError('User Email not found.', HttpCode.NOT_FOUND);
  return true;
};

export const deleteUser = async (uid: string): Promise<void> => {
  const userDoc = await userCollection.doc(uid).get();
  if (!userDoc.exists) throw new AppError('User data not found.', HttpCode.NOT_FOUND);
  await userCollection.doc(uid).delete();
  await auth!.deleteUser(uid);
};
