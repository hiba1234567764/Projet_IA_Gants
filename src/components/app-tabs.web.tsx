import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
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
            <TabButton icon="scan-outline">{t('tabs.scan')}</TabButton>
          </TabTrigger>
          <TabTrigger name="dashboard" href="/dashboard" asChild>
            <TabButton icon="grid-outline">{t('tabs.dashboard')}</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton icon="person-circle-outline">{t('tabs.account')}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: 'scan-outline' | 'grid-outline' | 'person-circle-outline' };

export function TabButton({ children, icon, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabPressable, pressed && styles.pressed]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.tabButtonView, isFocused && styles.tabButtonFocused]}>
        <Ionicons name={icon} size={15} color={isFocused ? '#5B5CE2' : '#64748B'} />
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
          <ThemedView style={isRTL ? styles.brandTextRTL : styles.brandText}>
            <Image source={require('../../assets/images/pip-logo.png')} style={styles.navLogo} contentFit="contain" />
          </ThemedView>
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
    boxShadow: '0 10px 25px -16px rgba(30,41,59,0.55)',
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
  navLogo: {
    width: 48,
    height: 22,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabButtonFocused: {
    backgroundColor: '#E9E7FF',
  },
  tabPressable: {
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
