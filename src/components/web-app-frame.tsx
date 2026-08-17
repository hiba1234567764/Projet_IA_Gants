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
      'radial-gradient(circle at 8% 8%, rgba(45, 212, 191, 0.5) 0%, transparent 35%), radial-gradient(circle at 95% 15%, rgba(129, 92, 246, 0.52) 0%, transparent 40%), radial-gradient(circle at 55% 100%, rgba(251, 146, 60, 0.4) 0%, transparent 42%), linear-gradient(135deg, #172554 0%, #312e81 100%)',
    backgroundColor: '#172554',
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
    boxShadow: '0 30px 80px -20px rgba(15,23,42,0.65), 0 0 0 1px rgba(255,255,255,0.24)',
  },
  frameNarrow: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    boxShadow: 'none',
  },
});
