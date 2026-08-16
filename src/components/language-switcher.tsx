import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useTheme } from '@/hooks/use-theme';
import { setAppLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

const LANGUAGE_LABELS: Record<SupportedLanguage, { flag: string; name: string }> = {
  en: { flag: '🇬🇧', name: 'English' },
  fr: { flag: '🇫🇷', name: 'Français' },
  ar: { flag: '🇸🇦', name: 'العربية' },
};

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRTL = useIsRTL();
  const [open, setOpen] = useState(false);

  const current = LANGUAGE_LABELS[i18n.language as SupportedLanguage] ?? LANGUAGE_LABELS.en;

  async function handleSelect(language: SupportedLanguage) {
    setOpen(false);
    if (language !== i18n.language) {
      await setAppLanguage(language);
    }
  }

  return (
    <>
      <Pressable
        accessibilityLabel={t('common.language')}
        style={({ pressed }) => [pressed && styles.pressed]}
        onPress={() => setOpen(true)}>
        <ThemedView
          type="backgroundElement"
          style={[styles.trigger, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="globe-outline" size={16} color={theme.text} />
          {!compact && <ThemedText type="small">{current.flag} {current.name}</ThemedText>}
        </ThemedView>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={() => {}}>
            <ThemedView type="backgroundElement" style={styles.sheet}>
              <ThemedText type="smallBold" style={styles.sheetTitle}>
                {t('common.language')}
              </ThemedText>
              {SUPPORTED_LANGUAGES.map((language) => {
                const isSelected = language === i18n.language;
                return (
                  <Pressable
                    key={language}
                    onPress={() => handleSelect(language)}
                    style={({ pressed }) => [pressed && styles.pressed]}>
                    <ThemedView
                      type={isSelected ? 'backgroundSelected' : 'background'}
                      style={[styles.option, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <ThemedText type="default">
                        {LANGUAGE_LABELS[language].flag} {LANGUAGE_LABELS[language].name}
                      </ThemedText>
                      {isSelected && <Ionicons name="checkmark" size={18} color={theme.text} />}
                    </ThemedView>
                  </Pressable>
                );
              })}
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    minHeight: 36,
  },
  pressed: {
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  sheetTitle: {
    marginBottom: Spacing.one,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 44,
  },
});
