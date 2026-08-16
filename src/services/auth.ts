import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/firebaseConfig';
import { createUserProfile, ensureUserProfileExists } from '@/services/userProfile';

export type { User };

export async function ensureUserProfile(userCredential: UserCredential): Promise<void> {
  if (getAdditionalUserInfo(userCredential)?.isNewUser) {
    await createUserProfile(userCredential.user.uid, userCredential.user.email ?? '');
  } else {
    await ensureUserProfileExists(userCredential.user.uid, userCredential.user.email ?? '');
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfileExists(credential.user.uid, credential.user.email ?? email);
  return credential;
}

export async function register(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(credential.user.uid, credential.user.email ?? email);
  return credential;
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/** Returns an i18n key under `auth.errors.*` — translate it with `t()` before displaying. */
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'auth.errors.invalidEmail';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'auth.errors.invalidCredential';
    case 'auth/email-already-in-use':
      return 'auth.errors.emailInUse';
    case 'auth/weak-password':
      return 'auth.errors.weakPassword';
    case 'auth/account-exists-with-different-credential':
      return 'auth.errors.accountExistsDifferentCredential';
    default:
      return 'auth.errors.generic';
  }
}
