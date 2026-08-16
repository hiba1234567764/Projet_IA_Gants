import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { auth } from '@/firebaseConfig';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { useTheme } from '@/hooks/use-theme';
import { detectGloveDefects, type DetectionResult } from '@/services/detection';
import { saveScanResult } from '@/services/scanHistory';

type ScanState = 'camera' | 'analyzing' | 'result';

export function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const [state, setState] = useState<ScanState>('camera');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);

  async function handleCapture() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (!photo) return;

    setPhotoUri(photo.uri);
    setState('analyzing');

    const detection = await detectGloveDefects(photo.uri);
    setResult(detection);
    setState('result');

    const uid = auth.currentUser?.uid;
    if (uid) {
      saveScanResult(detection, uid).catch((error) => {
        console.warn('Failed to save scan to history:', error);
      });
    }
  }

  function handleRetake() {
    setPhotoUri(null);
    setResult(null);
    setState('camera');
  }

  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.permissionSafeArea}>
          <ThemedView type="backgroundElement" style={styles.permissionIconBadge}>
            <Ionicons name="camera" color={theme.text} size={32} />
          </ThemedView>
          <ThemedText type="subtitle" style={styles.centerText}>
            {t('scan.cameraPermissionTitle')}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
            {t('scan.cameraPermissionDescription')}
          </ThemedText>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.text }]}
            onPress={requestPermission}>
            <ThemedText style={{ color: theme.background }} type="smallBold">
              {t('scan.grantPermission')}
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (state === 'camera') {
    return (
      <ThemedView style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <SafeAreaView style={styles.cameraOverlay} pointerEvents="box-none">
          <ThemedView type="backgroundElement" style={[styles.titlePill, { flexDirection: rowDirection }]}>
            <Ionicons name="camera-outline" size={16} color={theme.text} />
            <ThemedText type="smallBold">{t('scan.title')}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.frameGuide} pointerEvents="none" />

          <ThemedView style={styles.captureBar}>
            <Pressable style={styles.captureButton} onPress={handleCapture}>
              <ThemedView style={styles.captureButtonInner} />
            </Pressable>
            <ThemedText type="small" style={styles.captureHint}>
              {t('scan.frameHint')}
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.resultSafeArea}>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />}

        {state === 'analyzing' && (
          <ThemedView style={[styles.statusRow, { flexDirection: rowDirection }]}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small" themeColor="textSecondary">
              {t('scan.analyzing')}
            </ThemedText>
          </ThemedView>
        )}

        {state === 'result' && result && (
          <ThemedView type="backgroundElement" style={styles.resultCard}>
            <ThemedView style={[styles.resultHeaderRow, { flexDirection: rowDirection }]}>
              <Ionicons
                name={result.ok ? 'checkmark-circle' : 'warning'}
                color={result.ok ? '#1f9d55' : '#e0393e'}
                size={28}
              />
              <ThemedText type="subtitle" style={result.ok ? styles.okText : styles.problemText}>
                {result.ok ? t('scan.noProblemsFound') : t('scan.problemDetected')}
              </ThemedText>
            </ThemedView>
            {!result.ok &&
              result.defects.map((defect, index) => (
                <ThemedText key={`${defect.labelKey}-${index}`} type="small">
                  • {t(`detection.${defect.labelKey}`)} ({t('scan.confidence', { confidence: Math.round(defect.confidence * 100) })})
                </ThemedText>
              ))}
          </ThemedView>
        )}

        {state === 'result' && (
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.text }]}
            onPress={handleRetake}>
            <ThemedText style={{ color: theme.background }} type="smallBold">
              {t('scan.scanAgain')}
            </ThemedText>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 76 : Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  titlePill: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  frameGuide: {
    flex: 1,
    width: '85%',
    maxWidth: 340,
    marginVertical: Spacing.five,
    borderRadius: Spacing.four,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'transparent',
  },
  captureBar: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    backgroundColor: 'transparent',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
  },
  captureHint: {
    color: '#ffffff',
  },
  permissionSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  permissionIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  resultSafeArea: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Spacing.four,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  resultCard: {
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  okText: {
    color: '#1f9d55',
  },
  problemText: {
    color: '#e0393e',
  },
  primaryButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
});
