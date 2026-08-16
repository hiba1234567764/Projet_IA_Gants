import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';

import { db } from '@/firebaseConfig';
import type { DetectionResult, Defect } from '@/services/detection';

export type ScanRecord = {
  id: string;
  ok: boolean;
  defects: Defect[];
  createdAt: Date | null;
};

export async function saveScanResult(result: DetectionResult, uid: string): Promise<void> {
  await addDoc(collection(db, 'scans'), {
    uid,
    ok: result.ok,
    defects: result.defects,
    createdAt: serverTimestamp(),
  });
}

const RECENT_SCANS_LIMIT = 100;

/** Pass `uid` to scope results to one user's own scans; omit it to fetch across all users (admin view). */
export async function fetchRecentScans(uid?: string): Promise<ScanRecord[]> {
  const scansQuery = uid
    ? query(collection(db, 'scans'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(RECENT_SCANS_LIMIT))
    : query(collection(db, 'scans'), orderBy('createdAt', 'desc'), limit(RECENT_SCANS_LIMIT));
  const snapshot = await getDocs(scansQuery);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
    return {
      id: docSnapshot.id,
      ok: Boolean(data.ok),
      defects: Array.isArray(data.defects) ? data.defects : [],
      createdAt,
    };
  });
}
