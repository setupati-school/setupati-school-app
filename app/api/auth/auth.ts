import { db, auth } from '../../firebase.js';
import { User } from '../../models/User.js';
import { AppError, HttpCode } from '../../error.js';

if (!db || !auth)
  throw new AppError(
    'Database or Auth connection not established successfully',
    HttpCode.INTERNAL_SERVER_ERROR
  );
const userCollection = db.collection('users');

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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
