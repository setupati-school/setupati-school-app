import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAuth } from 'firebase/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const formatDate = (iso: string | undefined) => {
  try {
    let d;
    if (iso !== undefined) {
      d = new Date(iso);
      return d.toLocaleDateString();
    }
  } catch {
    return iso;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};


export const getTargetGroupColor = (group: string) => {
  switch (group.toLowerCase()) {
    case 'all':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'students':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'teachers':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'parents':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const isExpired = (validUntil: string): boolean => {
  return new Date(validUntil) < new Date();
};
