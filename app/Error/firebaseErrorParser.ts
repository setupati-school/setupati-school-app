import type { AppError } from '@setupati-school/setupati-types/error';

export const firebaseErrorParser = (
  error: unknown
): { httpCode: number; message: string } => {
  let code: string | undefined;
  let httpCode: number | undefined;
  let message: string | undefined;

  if (typeof error === 'object' && error !== null) {
    const e = error as Partial<AppError> & {
      code?: unknown;
      message?: unknown;
      httpCode?: unknown;
    };

    if (typeof e.code === 'string') {
      code = e.code;
    }
    if (typeof e.message === 'string') {
      message = e.message;
    }
    if (typeof e.httpCode === 'number') {
      httpCode = e.httpCode;
    }
  }

  let resolvedHttpCode = httpCode ?? 500;
  let resolvedMessage = message ?? 'An unknown error occurred';

  switch (code) {
    case 'auth/email-already-exists':
      resolvedHttpCode = 409;
      resolvedMessage =
        'The email address is already in use by another account.';
      break;

    case 'auth/invalid-email':
      resolvedHttpCode = 400;
      resolvedMessage = 'The email address is not valid.';
      break;

    case 'auth/invalid-password':
      resolvedHttpCode = 400;
      resolvedMessage =
        'The password is too weak or invalid. Please use a stronger password (at least 6 characters).';
      break;

    case 'auth/uid-already-exists':
      resolvedHttpCode = 409;
      resolvedMessage = 'The provided user ID is already in use.';
      break;

    case 'auth/phone-number-already-exists':
      resolvedHttpCode = 409;
      resolvedMessage =
        'The phone number is already in use by another account.';
      break;

    case 'auth/invalid-phone-number':
      resolvedHttpCode = 400;
      resolvedMessage = 'The phone number is not valid.';
      break;

    case 'auth/argument-error':
      resolvedHttpCode = 400;
      resolvedMessage = 'Invalid arguments provided for user creation.';
      break;

    case 'auth/quota-exceeded':
      resolvedHttpCode = 429;
      resolvedMessage = 'User creation quota exceeded. Please try again later.';
      break;

    case 'auth/claims-too-large':
      resolvedHttpCode = 400;
      resolvedMessage =
        'The custom claims payload is too large. Maximum size is 1000 bytes.';
      break;

    case 'auth/invalid-claims':
      resolvedHttpCode = 400;
      resolvedMessage =
        'The custom claims provided are invalid. Please ensure they are a plain object and do not contain reserved claims.';
      break;

    case 'auth/user-not-found':
      resolvedHttpCode = 404;
      resolvedMessage = 'No user found with the provided email or user ID.';
      break;

    case 'permission-denied':
      resolvedHttpCode = 403;
      resolvedMessage = 'You do not have permission to perform this action.';
      break;

    case 'unavailable':
      resolvedHttpCode = 503;
      resolvedMessage =
        'Firestore service is temporarily unavailable. Please try again shortly.';
      break;

    case 'invalid-argument':
      resolvedHttpCode = 400;
      resolvedMessage = 'The data provided for the profile is invalid.';
      break;

    case 'resource-exhausted':
      resolvedHttpCode = 429;
      resolvedMessage = 'Too many requests. Please try again later.';
      break;

    case 'cancelled':
    case 'deadline-exceeded':
      resolvedHttpCode = 504;
      resolvedMessage = 'The operation timed out. Please try again.';
      break;

    case 'aborted':
      resolvedHttpCode = 409;
      resolvedMessage =
        'The operation was aborted due to a conflict. Please try again.';
      break;

    case 'auth/invalid-uid':
      resolvedHttpCode = 400;
      resolvedMessage = 'The provided user ID is invalid.';
      break;

    case 'auth/network-request-failed':
      resolvedHttpCode = 503;
      resolvedMessage =
        'A network error occurred. Please check your internet connection or try again.';
      break;
  }

  return {
    httpCode: resolvedHttpCode,
    message: resolvedMessage
  };
};
