import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { auth } from '@/firebaseConfig';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useTheme } from '@/hooks/use-theme';
import { getAllUserProfiles, setUserRole, type UserProfile } from '@/services/userProfile';

type MessageState = { type: 'loadError' | 'updateError' } | { type: 'nowAdmin' | 'noLongerAdmin'; email: string };

export function ManageAdmins() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageState | null>(null);

  const visibleUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return needle ? users.filter((user) => user.email.toLowerCase().includes(needle)) : users;
  }, [search, users]);

  function messageText(state: MessageState): string {
    switch (state.type) {
      case 'loadError':
        return t('manageAdmins.loadError');
      case 'updateError':
        return t('manageAdmins.updateError');
      case 'nowAdmin':
        return t('manageAdmins.nowAdmin', { email: state.email });
      case 'noLongerAdmin':
        return t('manageAdmins.noLongerAdmin', { email: state.email });
    }
  }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      setUsers(await getAllUserProfiles());
    } catch {
      setMessage({ type: 'loadError' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleToggleRole(user: UserProfile) {
    if (user.uid === auth.currentUser?.uid) return;
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdatingUid(user.uid);
    setMessage(null);
    try {
      await setUserRole(user.uid, nextRole);
      setUsers((current) => current.map((item) => (item.uid === user.uid ? { ...item, role: nextRole } : item)));
      setMessage({ type: nextRole === 'admin' ? 'nowAdmin' : 'noLongerAdmin', email: user.email });
    } catch {
      setMessage({ type: 'updateError' });
    } finally {
      setUpdatingUid(null);
    }
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{t('manageAdmins.title')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('manageAdmins.description', { count: users.length })}
      </ThemedText>

      <ThemedView style={[styles.searchRow, { flexDirection: rowDirection }]}>
        <ThemedView type="backgroundSelected" style={[styles.searchInputRow, { flexDirection: rowDirection }]}>
          <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
          <ThemedTextInput
            style={styles.searchInput}
            placeholder={t('manageAdmins.placeholder')}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={search}
            onChangeText={setSearch}
          />
        </ThemedView>
        <Pressable
          disabled={loading}
          style={[styles.searchButton, { backgroundColor: theme.text, opacity: loading ? 0.5 : 1 }]}
          onPress={loadUsers}>
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <ThemedText style={{ color: theme.background }} type="smallBold">
              {t('manageAdmins.refresh')}
            </ThemedText>
          )}
        </Pressable>
      </ThemedView>

      {message && (
        <ThemedText type="small" themeColor="textSecondary">
          {messageText(message)}
        </ThemedText>
      )}

      {!loading && visibleUsers.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {search.trim() ? t('manageAdmins.noMatches') : t('manageAdmins.noAccounts')}
        </ThemedText>
      )}

      {visibleUsers.map((user) => {
        const isSelf = user.uid === auth.currentUser?.uid;
        const updating = updatingUid === user.uid;
        return (
          <ThemedView key={user.uid} type="backgroundSelected" style={[styles.resultRow, { flexDirection: rowDirection }]}>
            <ThemedView style={[styles.resultInfo, { flexDirection: rowDirection, alignItems: 'center' }]}>
              <Ionicons name="person-circle-outline" size={22} color={theme.textSecondary} />
              <ThemedView style={styles.resultTextColumn}>
                <ThemedText type="small">{user.email || t('manageAdmins.unknownEmail')}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {user.role === 'admin' ? t('manageAdmins.adminRole') : t('manageAdmins.regularUser')}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <Pressable
              disabled={updating || isSelf}
              style={[styles.toggleButton, { opacity: updating || isSelf ? 0.5 : 1 }]}
              onPress={() => handleToggleRole(user)}>
              {updating ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <ThemedText type="smallBold" style={user.role === 'admin' ? styles.removeText : styles.grantText}>
                  {isSelf
                    ? t('manageAdmins.cantChangeSelf')
                    : user.role === 'admin'
                      ? t('manageAdmins.removeAdmin')
                      : t('manageAdmins.makeAdmin')}
                </ThemedText>
              )}
            </Pressable>
          </ThemedView>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  searchInputRow: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  searchButton: {
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  resultInfo: {
    flex: 1,
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  resultTextColumn: {
    flex: 1,
    gap: Spacing.half,
    backgroundColor: 'transparent',
  },
  toggleButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 44,
    justifyContent: 'center',
  },
  grantText: {
    color: '#1f9d55',
  },
  removeText: {
    color: '#e0393e',
  },
});
