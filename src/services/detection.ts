export type DefectLabelKey = 'tornSeam' | 'holeInFingertip' | 'stain' | 'missingStitching' | 'discoloration';

export type Defect = {
  /** Key into the `detection.*` translation namespace — translate with `t()` before displaying. */
  labelKey: DefectLabelKey;
  confidence: number;
};

export type DetectionResult = {
  ok: boolean;
  defects: Defect[];
};

const MOCK_DEFECT_LABEL_KEYS: DefectLabelKey[] = [
  'tornSeam',
  'holeInFingertip',
  'stain',
  'missingStitching',
  'discoloration',
];

/**
 * Placeholder until the trained model's inference endpoint is wired in —
 * returns a randomized result so the app flow can be built/tested end to end.
 */
export async function detectGloveDefects(imageUri: string): Promise<DetectionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const hasDefect = Math.random() < 0.5;
  if (!hasDefect) {
    return { ok: true, defects: [] };
  }

  const defectCount = 1 + Math.floor(Math.random() * 2);
  const defects: Defect[] = Array.from({ length: defectCount }, () => ({
    labelKey: MOCK_DEFECT_LABEL_KEYS[Math.floor(Math.random() * MOCK_DEFECT_LABEL_KEYS.length)],
    confidence: 0.6 + Math.random() * 0.35,
  }));

  return { ok: false, defects };
}
