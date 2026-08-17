import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { db, functions } from '@/firebaseConfig';

export type UserRole = 'user' | 'admin';

export type UserProfile = {
  uid: string;
  email: string;
  role: UserRole;
};

export async function createUserProfile(uid: string, email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await setDoc(doc(db, 'users', uid), {
    email: normalizedEmail,
    role: 'user',
    createdAt: serverTimestamp(),
  });
}

export async function ensureUserProfileExists(uid: string, email: string): Promise<void> {
  const profileRef = doc(db, 'users', uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) await createUserProfile(uid, email);
}

export async function getUserRole(uid: string): Promise<UserRole> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.data()?.role === 'admin' ? 'admin' : 'user';
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const usersQuery = query(collection(db, 'users'), where('email', '==', normalizedEmail), limit(1));
  const snapshot = await getDocs(usersQuery);

  if (snapshot.empty) return null;

  const docSnapshot = snapshot.docs[0];
  const data = docSnapshot.data();
  return {
    uid: docSnapshot.id,
    email: data.email ?? normalizedEmail,
    role: data.role === 'admin' ? 'admin' : 'user',
  };
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs
    .map((profile) => {
      const data = profile.data();
      return {
        uid: profile.id,
        email: typeof data.email === 'string' ? data.email : '',
        role: data.role === 'admin' ? 'admin' : 'user',
      } satisfies UserProfile;
    })
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function deleteUserAccount(uid: string): Promise<void> {
  await httpsCallable<{ uid: string }, void>(functions, 'deleteUserAccount')({ uid });
}
