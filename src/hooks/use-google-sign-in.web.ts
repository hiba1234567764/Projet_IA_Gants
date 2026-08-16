import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';

import { auth } from '@/firebaseConfig';
import { ensureUserProfile } from '@/services/auth';

export function useGoogleSignIn(onError: (error: unknown) => void) {
  const [signingIn, setSigningIn] = useState(false);

  async function signIn() {
    setSigningIn(true);
    try {
      const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserProfile(userCredential);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        onError(error);
      }
    } finally {
      setSigningIn(false);
    }
  }

  return { ready: true, signingIn, signIn };
}
