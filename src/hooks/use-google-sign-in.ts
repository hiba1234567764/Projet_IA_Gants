import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '@/firebaseConfig';
import { ensureUserProfile } from '@/services/auth';
import { GOOGLE_WEB_CLIENT_ID } from '@/services/googleAuthConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn(onError: (error: unknown) => void) {
  const [signingIn, setSigningIn] = useState(false);
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      setSigningIn(true);
      const credential = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(auth, credential)
        .then(ensureUserProfile)
        .catch(onError)
        .finally(() => setSigningIn(false));
    } else if (response.type === 'error') {
      onError(response.error);
    }
    // 'dismiss' and 'cancel' mean the user closed the picker themselves — not an error.
  }, [response]);

  return {
    ready: !!request,
    signingIn,
    signIn: () => promptAsync(),
  };
}
