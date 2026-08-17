import { AntDesign } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useGoogleSignIn } from '@/hooks/use-google-sign-in';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useTheme } from '@/hooks/use-theme';
import { getAuthErrorMessage, login, register, resetPassword } from '@/services/auth';

type Mode = 'login' | 'register' | 'reset';

export function AuthScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 700;
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';
  const isReset = mode === 'reset';
  const canSubmit = isReset
    ? email.trim().length > 0 && !submitting
    : email.trim().length > 0 && password.length > 0 && !submitting;

  function switchMode(nextMode: Mode) {
    setError(null);
    setResetSent(false);
    setMode(nextMode);
  }

  const { ready: googleReady, signingIn: googleSigningIn, signIn: signInWithGoogle } = useGoogleSignIn(
    (googleError) => setError(t(getAuthErrorMessage(googleError))),
  );

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      if (isReset) {
        await resetPassword(email.trim());
        setResetSent(true);
      } else if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
    } catch (submitError) {
      setError(t(getAuthErrorMessage(submitError)));
    } finally {
      setSubmitting(false);
    }
  }

  const rowDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.languageRow, { flexDirection: rowDirection }]}>
            <LanguageSwitcher />
          </View>

          <ThemedView style={[styles.header, isWideScreen && { flexDirection: rowDirection, gap: Spacing.four }]}>
            <ThemedView style={styles.brandMark}>
              <Image source={require('../../assets/images/pip-logo.png')} style={styles.pipLogo} contentFit="contain" />
            </ThemedView>
            <ThemedView style={isWideScreen && styles.headerTextWide}>
              <ThemedText
                type="title"
                style={[styles.title, isWideScreen && (isRTL ? styles.textRight : styles.textLeft)]}>
                {t('common.appName')}
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={[styles.centerText, isWideScreen && (isRTL ? styles.textRight : styles.textLeft)]}>
                {isReset
                  ? t('auth.subtitleReset')
                  : isLogin
                    ? t('auth.subtitleLogin')
                    : t('auth.subtitleRegister')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedView type="backgroundSelected" style={[styles.inputRow, { flexDirection: rowDirection }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
              <ThemedTextInput
                style={styles.inputFlex}
                placeholder={t('auth.emailPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </ThemedView>
            {!isReset && (
              <ThemedView type="backgroundSelected" style={[styles.inputRow, { flexDirection: rowDirection }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                <ThemedTextInput
                  style={styles.inputFlex}
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </ThemedView>
            )}

            {error && (
              <View style={[styles.messageRow, { flexDirection: rowDirection }]}>
                <Ionicons name="alert-circle" size={16} color="#e0393e" />
                <ThemedText type="small" style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            )}

            {resetSent && !error && (
              <View style={[styles.messageRow, { flexDirection: rowDirection }]}>
                <Ionicons name="checkmark-circle" size={16} color="#1f9d55" />
                <ThemedText type="small" style={styles.successText}>
                  {t('auth.resetSentMessage')}
                </ThemedText>
              </View>
            )}

            <Pressable
              disabled={!canSubmit}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.text, opacity: canSubmit ? 1 : 0.5 },
              ]}
              onPress={handleSubmit}>
              {submitting ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <ThemedText style={{ color: theme.background }} type="smallBold">
                  {isReset ? t('auth.sendResetLink') : isLogin ? t('auth.logIn') : t('auth.createAccount')}
                </ThemedText>
              )}
            </Pressable>
          </ThemedView>

          {!isReset && (
            <ThemedView style={[styles.dividerRow, { flexDirection: rowDirection }]}>
              <ThemedView type="backgroundSelected" style={styles.dividerLine} />
              <ThemedText type="small" themeColor="textSecondary">
                {t('auth.or')}
              </ThemedText>
              <ThemedView type="backgroundSelected" style={styles.dividerLine} />
            </ThemedView>
          )}

          {!isReset && (
            <Pressable
              disabled={!googleReady || googleSigningIn}
              style={[
                styles.googleButton,
                { flexDirection: rowDirection, opacity: !googleReady || googleSigningIn ? 0.5 : 1 },
              ]}
              onPress={signInWithGoogle}>
              {googleSigningIn ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <>
                  <AntDesign name="google" size={18} color="#4285F4" />
                  <ThemedText type="smallBold">{t('auth.continueWithGoogle')}</ThemedText>
                </>
              )}
            </Pressable>
          )}

          {isLogin && (
            <Pressable onPress={() => switchMode('reset')}>
              <ThemedText type="link" themeColor="textSecondary" style={styles.centerText}>
                {t('auth.forgotPassword')}
              </ThemedText>
            </Pressable>
          )}

          <Pressable onPress={() => switchMode(isReset ? 'login' : isLogin ? 'register' : 'login')}>
            <ThemedText type="link" themeColor="textSecondary" style={styles.centerText}>
              {isReset ? t('auth.backTo') : isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
              <ThemedText type="linkPrimary">
                {isReset ? t('auth.logInLink') : isLogin ? t('auth.register') : t('auth.logIn')}
              </ThemedText>
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  languageRow: {
    justifyContent: 'flex-end',
    marginBottom: -Spacing.three,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 196,
    height: 82,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  pipLogo: {
    width: '100%',
    height: '100%',
  },
  headerTextWide: {
    flex: 1,
    backgroundColor: 'transparent',
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 38,
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  centerText: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  inputRow: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  inputIcon: {
    marginTop: 1,
  },
  inputFlex: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  messageRow: {
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#e0393e',
    flexShrink: 1,
  },
  successText: {
    color: '#1f9d55',
    flexShrink: 1,
  },
  primaryButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: -Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    marginTop: -Spacing.two,
  },
});
