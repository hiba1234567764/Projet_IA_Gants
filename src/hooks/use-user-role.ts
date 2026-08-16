import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/firebaseConfig';
import { getUserRole, type UserRole } from '@/services/userProfile';

export function useUserRole(): UserRole | null {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setRole('user');
        return;
      }

      try {
        const fetchedRole = await getUserRole(user.uid);
        if (!cancelled) setRole(fetchedRole);
      } catch (error) {
        console.warn('Failed to load user role, defaulting to "user":', error);
        if (!cancelled) setRole('user');
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return role;
}
