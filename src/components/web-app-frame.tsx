import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const FRAME_WIDTH = 480;
const FRAME_MAX_HEIGHT = 900;
const NARROW_VIEWPORT_BREAKPOINT = 560;

export function WebAppFrame({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isNarrowViewport = width < NARROW_VIEWPORT_BREAKPOINT;

  return (
    <View style={[styles.backdrop, isNarrowViewport && styles.backdropNarrow]}>
      <View
        style={[
          styles.frame,
          { backgroundColor: theme.background },
          isNarrowViewport && styles.frameNarrow,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    experimental_backgroundImage:
      'radial-gradient(circle at 12% 8%, rgba(60,159,254,0.35) 0%, transparent 42%), radial-gradient(circle at 88% 92%, rgba(2,116,223,0.3) 0%, transparent 42%), radial-gradient(circle at 90% 10%, rgba(60,159,254,0.15) 0%, transparent 35%)',
    backgroundColor: '#0b1120',
  },
  backdropNarrow: {
    padding: 0,
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: FRAME_WIDTH,
    maxHeight: FRAME_MAX_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
    boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
  },
  frameNarrow: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    boxShadow: 'none',
  },
});
