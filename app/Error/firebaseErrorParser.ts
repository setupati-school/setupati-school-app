import { AppError } from '@setupati-school/setupati-types';

export const firebaseErrorParser = (
  error: AppError
): { httpCode: number; message: string } => {
  let httpCode = error?.httpCode || 500;
  let message = error.message;

  switch (error.code) {
    case 'auth/email-already-exists':
      httpCode = 409;
      message = 'The email address is already in use by another account.';
      break;
    case 'auth/invalid-email':
      httpCode = 400;
      message = 'The email address is not valid.';
      break;
    case 'auth/invalid-password':
      httpCode = 400;
      message =
        'The password is too weak or invalid. Please use a stronger password (at least 6 characters).';
      break;
    case 'auth/uid-already-exists':
      httpCode = 409;
      message = 'The provided user ID is already in use.';
      break;
    case 'auth/phone-number-already-exists':
      httpCode = 409;
      message = 'The phone number is already in use by another account.';
      break;
    case 'auth/invalid-phone-number':
      httpCode = 400;
      message = 'The phone number is not valid.';
      break;
    case 'auth/argument-error':
      httpCode = 400;
      message = 'Invalid arguments provided for user creation.';
      break;
    case 'auth/quota-exceeded':
      httpCode = 429;
      message = 'User creation quota exceeded. Please try again later.';
      break;
    case 'auth/claims-too-large':
      httpCode = 400;
      message =
        'The custom claims payload is too large. Maximum size is 1000 bytes.';
      break;
    case 'auth/invalid-claims':
      httpCode = 400;
      message =
        'The custom claims provided are invalid. Please ensure they are a plain object and do not contain reserved claims.';
      break;
    case 'auth/user-not-found':
      httpCode = 404;
      message = 'No user found with the provided email or user ID.';
      break;
    case 'permission-denied':
      httpCode = 403;
      message = 'You do not have permission to perform this action.';
      break;
    case 'unavailable':
      httpCode = 503;
      message =
        'Firestore service is temporarily unavailable. Please try again shortly.';
      break;
    case 'invalid-argument':
      httpCode = 400;
      message = 'The data provided for the profile is invalid.';
      break;
    case 'resource-exhausted':
      httpCode = 429;
      message = 'Too many requests. Please try again later.';
      break;
    case 'cancelled':
    case 'deadline-exceeded':
      httpCode = 504;
      message = 'The operation timed out. Please try again.';
      break;
    case 'aborted':
      httpCode = 409;
      message =
        'The operation was aborted due to a conflict. Please try again.';
      break;
    case 'auth/invalid-uid':
      httpCode = 400;
      message = 'The provided user ID is invalid.';
      break;
    case 'auth/network-request-failed':
      httpCode = 503;
      message =
        'A network error occurred. Please check your internet connection or try again.';
      break;
  }
  return { httpCode, message } as AppError;
};
