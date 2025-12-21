import { DocumentData } from 'firebase/firestore';

export const mapDocsWithKey = <T, K extends string>(
  docs: DocumentData[],
  key: K
): ({ id: string } & Record<K, T | null>)[] => {
  return docs.map(
    (doc) =>
      ({
        id: doc.id,
        [key]: doc.data() as T
      }) as { id: string } & Record<K, T | null>
  );
};

export const now = new Date().toISOString();
