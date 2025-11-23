import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
