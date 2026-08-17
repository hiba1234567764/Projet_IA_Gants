import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ManageAdmins } from '@/components/manage-admins';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { auth } from '@/firebaseConfig';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useTheme } from '@/hooks/use-theme';
import { useUserRole } from '@/hooks/use-user-role';
import { logout } from '@/services/auth';

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const role = useUserRole();
  const [signingOut, setSigningOut] = useState(false);

  const email = auth.currentUser?.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedView style={styles.eyebrow}>
            <Ionicons name="person-circle-outline" size={14} color="#5B5CE2" />
            <ThemedText type="smallBold" style={styles.eyebrowText}>MY WORKSPACE</ThemedText>
          </ThemedView>
          <ThemedText type="subtitle">{t('account.title')}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <ThemedView type="backgroundElement" style={[styles.accountCard, { flexDirection: rowDirection }]}>
            <ThemedView style={styles.avatar}>
              <ThemedText type="subtitle" style={{ color: theme.background }}>
                {initial}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.accountInfo}>
              <ThemedView style={[styles.nameRow, { flexDirection: rowDirection }]}>
                <ThemedText type="smallBold" numberOfLines={1} style={styles.email}>
                  {email || t('account.signedIn')}
                </ThemedText>
                {role === 'admin' && (
                  <ThemedView type="backgroundSelected" style={[styles.roleBadge, { flexDirection: rowDirection }]}>
                    <Ionicons name="shield-checkmark" size={12} color={theme.text} />
                    <ThemedText type="small">{t('account.admin')}</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
              <ThemedText type="small" themeColor="textSecondary">
                {role === 'admin' ? t('account.adminDescription') : t('account.userDescription')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.languageSettingRow, { flexDirection: rowDirection }]}>
            <ThemedView style={[styles.languageSettingLabel, { flexDirection: rowDirection }]}>
              <Ionicons name="globe-outline" size={18} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {t('account.language')}
              </ThemedText>
            </ThemedView>
            <LanguageSwitcher />
          </ThemedView>

          <Pressable
            style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
            disabled={signingOut}
            onPress={handleSignOut}>
            <ThemedView type="backgroundElement" style={[styles.signOutContent, { flexDirection: rowDirection }]}>
              {signingOut ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <>
                  <Ionicons name="log-out-outline" color="#e0393e" size={18} />
                  <ThemedText type="smallBold" style={styles.signOutText}>
                    {t('account.signOut')}
                  </ThemedText>
                </>
              )}
            </ThemedView>
          </Pressable>

          {role === 'admin' && <ManageAdmins />}
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' },
  eyebrowText: { color: '#5B5CE2', fontSize: 11, letterSpacing: 1.1 },
  sectionsWrapper: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    boxShadow: '0 12px 22px -18px rgba(30,41,59,0.55)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B5CE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  email: {
    flexShrink: 1,
  },
  roleBadge: {
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  languageSettingRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageSettingLabel: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  signOutButton: {
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
  },
  signOutText: {
    color: '#e0393e',
  },
});
