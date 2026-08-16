import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthScreen } from '@/components/auth-screen';
import { ThemedView } from '@/components/themed-view';
import { WebAppFrame } from '@/components/web-app-frame';
import { loadPersistedLanguage } from '@/i18n';
import { subscribeToAuthChanges, type User } from '@/services/auth';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => subscribeToAuthChanges(setUser), []);
  useEffect(() => {
    loadPersistedLanguage();
  }, []);

  const content = user === undefined ? <ThemedView style={{ flex: 1 }} /> : user ? <AppTabs /> : <AuthScreen />;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {Platform.OS === 'web' ? <WebAppFrame>{content}</WebAppFrame> : content}
    </ThemeProvider>
  );
}
