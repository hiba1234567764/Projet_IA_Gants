import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { auth } from '@/firebaseConfig';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useTheme } from '@/hooks/use-theme';
import { deleteUserAccount, getAllUserProfiles, setUserRole, type UserProfile } from '@/services/userProfile';

type MessageState =
  | { type: 'loadError' | 'updateError' | 'deleteError' }
  | { type: 'nowAdmin' | 'noLongerAdmin' | 'deleted'; email: string };

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
      case 'deleteError':
        return t('manageAdmins.deleteError');
      case 'nowAdmin':
        return t('manageAdmins.nowAdmin', { email: state.email });
      case 'noLongerAdmin':
        return t('manageAdmins.noLongerAdmin', { email: state.email });
      case 'deleted':
        return t('manageAdmins.deleted', { email: state.email });
    }
  }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      setUsers(await getAllUserProfiles());
    } catch (error) {
      console.error('Failed to load user profiles:', error);
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
    } catch (error) {
      console.error(`Failed to update role for user ${user.uid}:`, error);
      setMessage({ type: 'updateError' });
    } finally {
      setUpdatingUid(null);
    }
  }

  function confirmDelete(user: UserProfile) {
    const remove = async () => {
      setUpdatingUid(user.uid);
      setMessage(null);
      try {
        await deleteUserAccount(user.uid);
        setUsers((current) => current.filter((item) => item.uid !== user.uid));
        setMessage({ type: 'deleted', email: user.email });
      } catch (error) {
        console.error(`Failed to delete account ${user.uid}:`, error);
        setMessage({ type: 'deleteError' });
      } finally {
        setUpdatingUid(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('manageAdmins.deleteConfirm', { email: user.email }))) void remove();
      return;
    }
    Alert.alert(t('manageAdmins.deleteAccount'), t('manageAdmins.deleteConfirm', { email: user.email }), [
      { text: t('manageAdmins.cancel'), style: 'cancel' },
      { text: t('manageAdmins.deleteAccount'), style: 'destructive', onPress: remove },
    ]);
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedView style={[styles.header, { flexDirection: rowDirection }]}>
        <ThemedView style={styles.headerIcon}>
          <Ionicons name="people" size={20} color="#3c87f7" />
        </ThemedView>
        <ThemedView style={styles.headerCopy}>
          <ThemedText type="smallBold">{t('manageAdmins.title')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('manageAdmins.description', { count: users.length })}
          </ThemedText>
        </ThemedView>
        <ThemedView type="backgroundSelected" style={styles.countBadge}>
          <ThemedText type="smallBold">{users.length}</ThemedText>
        </ThemedView>
      </ThemedView>

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
          accessibilityLabel={t('manageAdmins.refresh')}
          style={({ pressed }) => [styles.searchButton, { backgroundColor: theme.text, opacity: loading ? 0.5 : pressed ? 0.75 : 1 }]}
          onPress={loadUsers}>
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Ionicons name="refresh" size={19} color={theme.background} />
          )}
        </Pressable>
      </ThemedView>

      {message && (
        <ThemedView
          style={[
            styles.message,
            { flexDirection: rowDirection },
            ['loadError', 'updateError', 'deleteError'].includes(message.type) ? styles.errorMessage : styles.successMessage,
          ]}>
          <Ionicons
            name={['loadError', 'updateError', 'deleteError'].includes(message.type) ? 'alert-circle' : 'checkmark-circle'}
            size={17}
            color={['loadError', 'updateError', 'deleteError'].includes(message.type) ? '#e0393e' : '#1f9d55'}
          />
          <ThemedText type="small" style={styles.messageText}>{messageText(message)}</ThemedText>
        </ThemedView>
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
          <ThemedView key={user.uid} type="backgroundSelected" style={styles.resultRow}>
            <ThemedView style={[styles.resultInfo, { flexDirection: rowDirection, alignItems: 'center' }]}>
              <ThemedView style={styles.avatar}>
                <ThemedText type="smallBold" style={styles.avatarText}>
                  {(user.email || '?').charAt(0).toUpperCase()}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.resultTextColumn}>
                <ThemedText type="smallBold" numberOfLines={1}>{user.email || t('manageAdmins.unknownEmail')}</ThemedText>
                <ThemedView style={[styles.roleLine, { flexDirection: rowDirection }]}>
                  <Ionicons name={user.role === 'admin' ? 'shield-checkmark' : 'person-outline'} size={13} color={user.role === 'admin' ? '#3c87f7' : theme.textSecondary} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {user.role === 'admin' ? t('manageAdmins.adminRole') : t('manageAdmins.regularUser')}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView style={[styles.actions, { flexDirection: rowDirection }]}>
              {updating ? <ActivityIndicator color={theme.text} /> : (
                <>
                  <Pressable
                    disabled={isSelf}
                    style={({ pressed }) => [styles.actionButton, styles.roleButton, { opacity: isSelf ? 0.45 : pressed ? 0.7 : 1 }]}
                    onPress={() => handleToggleRole(user)}>
                    <Ionicons name={user.role === 'admin' ? 'shield-outline' : 'shield-checkmark-outline'} size={16} color={user.role === 'admin' ? '#e09b3e' : '#1f9d55'} />
                    <ThemedText type="smallBold" style={user.role === 'admin' ? styles.demoteText : styles.grantText}>
                      {isSelf
                        ? t('manageAdmins.cantChangeSelf')
                        : user.role === 'admin'
                          ? t('manageAdmins.removeAdmin')
                          : t('manageAdmins.makeAdmin')}
                    </ThemedText>
                  </Pressable>
                  {!isSelf && (
                    <Pressable style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.pressed]} onPress={() => confirmDelete(user)}>
                      <Ionicons name="trash-outline" size={16} color="#e0393e" />
                      <ThemedText type="smallBold" style={styles.removeText}>
                        {t('manageAdmins.deleteAccount')}
                      </ThemedText>
                    </Pressable>
                  )}
                </>
              )}
            </ThemedView>
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
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3c87f71a',
  },
  headerCopy: {
    flex: 1,
    gap: Spacing.half,
    backgroundColor: 'transparent',
  },
  countBadge: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: Spacing.two,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultRow: {
    gap: Spacing.three,
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
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3c87f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
  },
  roleLine: {
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 42,
    borderRadius: Spacing.three,
    justifyContent: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing.two,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  roleButton: {
    backgroundColor: '#1f9d5514',
  },
  deleteButton: {
    backgroundColor: '#e0393e14',
  },
  pressed: {
    opacity: 0.7,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  messageText: {
    flex: 1,
  },
  errorMessage: {
    backgroundColor: '#e0393e14',
  },
  successMessage: {
    backgroundColor: '#1f9d5514',
  },
  grantText: {
    color: '#1f9d55',
  },
  demoteText: {
    color: '#e09b3e',
  },
  removeText: {
    color: '#e0393e',
  },
});
