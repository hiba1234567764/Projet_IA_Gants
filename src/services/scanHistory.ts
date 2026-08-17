import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { db, storage } from '@/firebaseConfig';
import type { DetectionResult, Defect } from '@/services/detection';

export type ScanRecord = {
  id: string;
  ok: boolean;
  defects: Defect[];
  createdAt: Date | null;
  photoUrl: string | null;
};

async function uploadScanPhoto(photoUri: string, uid: string): Promise<string> {
  const response = await fetch(photoUri);
  const photo = await response.blob();
  const photoRef = ref(storage, `scans/${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);

  await uploadBytes(photoRef, photo, { contentType: 'image/jpeg' });
  return getDownloadURL(photoRef);
}

export async function saveScanResult(result: DetectionResult, uid: string, photoUri: string): Promise<void> {
  // Keep the detection in history even if an image upload is temporarily unavailable.
  // Older and failed uploads are rendered without a thumbnail in the dashboard.
  let photoUrl: string | null = null;
  try {
    photoUrl = await uploadScanPhoto(photoUri, uid);
  } catch (error) {
    console.warn('Failed to upload scan photo:', error);
  }

  await addDoc(collection(db, 'scans'), {
    uid,
    ok: result.ok,
    defects: result.defects,
    photoUrl,
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
      photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : null,
    };
  });
}
