import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" androidSrc={require('@/assets/images/tabIcons/home.png')} />
        <Label>{t('tabs.scan')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="dashboard">
        <Icon sf="chart.bar.fill" androidSrc={require('@/assets/images/tabIcons/dashboard.png')} />
        <Label>{t('tabs.dashboard')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <Icon sf="person.crop.circle.fill" androidSrc={require('@/assets/images/tabIcons/explore.png')} />
        <Label>{t('tabs.account')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
