import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { auth } from '@/firebaseConfig';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useTheme } from '@/hooks/use-theme';
import { useUserRole } from '@/hooks/use-user-role';
import { fetchRecentScans, type ScanRecord } from '@/services/scanHistory';

function formatDate(date: Date | null, justNowLabel: string): string {
  if (!date) return justNowLabel;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DashboardScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const role = useUserRole();
  const isAdmin = role === 'admin';

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [scans, setScans] = useState<ScanRecord[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(false);
      const records = await fetchRecentScans(isAdmin ? undefined : auth.currentUser?.uid);
      setScans(records);
    } catch (loadError) {
      console.warn('Failed to load scans:', loadError);
      setError(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (role !== null) load();
  }, [role, load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const total = scans?.length ?? 0;
  const problems = scans?.filter((scan) => !scan.ok).length ?? 0;
  const passed = total - problems;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : null;

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
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">{t('dashboard.title')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isAdmin
              ? total >= 100
                ? t('dashboard.basedOnLast100AllUsers')
                : t('dashboard.allScansAllUsers')
              : total >= 100
                ? t('dashboard.basedOnLast100Mine')
                : t('dashboard.allScansMine')}
          </ThemedText>
        </ThemedView>

        {scans === null && !error && (
          <ThemedView style={styles.loadingRow}>
            <ActivityIndicator color={theme.text} />
          </ThemedView>
        )}

        {error && (
          <ThemedView style={styles.section}>
            <ThemedView style={[styles.errorRow, { flexDirection: rowDirection }]}>
              <Ionicons name="alert-circle" size={16} color="#e0393e" />
              <ThemedText type="small" style={styles.errorText}>
                {t('dashboard.loadError')}
              </ThemedText>
            </ThemedView>
            <Pressable onPress={load}>
              <ThemedText type="linkPrimary">{t('common.tryAgain')}</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        {scans !== null && (
          <>
            <ThemedView style={styles.statsRow}>
              <ThemedView type="backgroundElement" style={styles.statTile}>
                <Ionicons name="camera-outline" size={18} color={theme.textSecondary} />
                <ThemedText type="title" style={styles.statNumber}>
                  {total}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('dashboard.totalScans')}
                </ThemedText>
              </ThemedView>
              <ThemedView type="backgroundElement" style={styles.statTile}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#1f9d55" />
                <ThemedText type="title" style={[styles.statNumber, styles.okText]}>
                  {passed}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('dashboard.passed')}
                </ThemedText>
              </ThemedView>
              <ThemedView type="backgroundElement" style={styles.statTile}>
                <Ionicons name="warning-outline" size={18} color="#e0393e" />
                <ThemedText type="title" style={[styles.statNumber, styles.problemText]}>
                  {problems}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('dashboard.problems')}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {passRate !== null && (
              <ThemedView style={[styles.passRateRow, { flexDirection: rowDirection }]}>
                <Ionicons name="trending-up-outline" size={14} color={theme.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">
                  {t('dashboard.passRate', { rate: passRate })}
                </ThemedText>
              </ThemedView>
            )}

            <ThemedView style={styles.section}>
              <ThemedText type="smallBold">{t('dashboard.recentScans')}</ThemedText>
              {scans.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('dashboard.noScans')}
                </ThemedText>
              ) : (
                scans.map((scan) => (
                  <ThemedView key={scan.id} type="backgroundElement" style={[styles.scanRow, { flexDirection: rowDirection }]}>
                    {scan.photoUrl && (
                      <Image
                        source={{ uri: scan.photoUrl }}
                        style={styles.scanPhoto}
                        contentFit="cover"
                        accessibilityLabel={t('dashboard.recentScans')}
                      />
                    )}
                    <Ionicons
                      name={scan.ok ? 'checkmark-circle' : 'warning'}
                      color={scan.ok ? '#1f9d55' : '#e0393e'}
                      size={20}
                    />
                    <ThemedView style={styles.scanRowContent}>
                      <ThemedText type="small">
                        {scan.ok
                          ? t('dashboard.noProblemsFound')
                          : scan.defects.map((d) => t(`detection.${d.labelKey}`)).join(', ') ||
                            t('dashboard.problemDetected')}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {formatDate(scan.createdAt, t('dashboard.justNow'))}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                ))
              )}
            </ThemedView>
          </>
        )}
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
    flexGrow: 1,
    width: '100%',
  },
  titleContainer: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  loadingRow: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  statTile: {
    flex: 1,
    minWidth: 100,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.half,
  },
  statNumber: {
    fontSize: 28,
    lineHeight: 32,
  },
  passRateRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  okText: {
    color: '#1f9d55',
  },
  problemText: {
    color: '#e0393e',
  },
  errorRow: {
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#e0393e',
    flexShrink: 1,
  },
  section: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  scanRowContent: {
    flex: 1,
    gap: Spacing.half,
    backgroundColor: 'transparent',
  },
  scanPhoto: {
    width: 64,
    height: 64,
    borderRadius: Spacing.two,
    backgroundColor: '#2E3135',
  },
});
