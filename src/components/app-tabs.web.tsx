import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, useColorScheme, useWindowDimensions, View, StyleSheet } from 'react-native';

import { ExternalLink } from './external-link';
import { LanguageSwitcher } from './language-switcher';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useIsRTL } from '@/hooks/use-is-rtl';

export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>{t('tabs.scan')}</TabButton>
          </TabTrigger>
          <TabTrigger name="dashboard" href="/dashboard" asChild>
            <TabButton>{t('tabs.dashboard')}</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>{t('tabs.account')}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isRTL = useIsRTL();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  // The web app is displayed in a 480px-wide frame. Keep the navigation inside
  // that frame instead of allowing the brand and documentation link to clip.
  const isCompact = width <= 540;

  return (
    <View {...props} style={[styles.tabListContainer, isCompact && styles.tabListContainerCompact, { flexDirection: rowDirection }]}>
      <ThemedView type="backgroundElement" style={[styles.innerContainer, isCompact && styles.innerContainerCompact, { flexDirection: rowDirection }]}>
        {!isCompact && (
          <ThemedText type="smallBold" style={isRTL ? styles.brandTextRTL : styles.brandText}>
            {t('common.appName')}
          </ThemedText>
        )}

        {props.children}

        <LanguageSwitcher compact />

        {!isCompact && (
          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={isRTL ? styles.externalPressableRTL : styles.externalPressable}>
              <ThemedText type="link">{t('tabs.docs')}</ThemedText>
              <Ionicons name="open-outline" color={colors.text} size={12} />
            </Pressable>
          </ExternalLink>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabListContainerCompact: {
    padding: Spacing.two,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  innerContainerCompact: {
    width: '100%',
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
    justifyContent: 'center',
  },
  brandText: {
    marginRight: 'auto',
  },
  brandTextRTL: {
    marginLeft: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
  externalPressableRTL: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.one,
    marginRight: Spacing.three,
  },
});
