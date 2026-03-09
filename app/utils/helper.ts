import type admin from 'firebase-admin';

export const now = (): string => new Date().toISOString();

export const docToFlat = <T extends object>(
  doc: admin.firestore.DocumentSnapshot
): T & { id: string } => ({
  id: doc.id,
  ...(doc.data() as T)
});

export const docsToFlat = <T extends object>(
  docs: admin.firestore.QueryDocumentSnapshot[]
): (T & { id: string })[] => docs.map((doc) => docToFlat<T>(doc));
