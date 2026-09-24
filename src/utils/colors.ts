/**
 * Exact palette defined in the brief (all mandatory):
 * - Deep shadow green:   #0a1f1a
 * - Mid forest green:    #1a3d2e
 * - Moss accent:         #2d5a4a
 * - Sun ray gold:        #c9a961
 * - Warm amber:          #ffb347
 * - Firefly lime:        #d4ff7a
 * - Spirit cyan:         #7fffcf
 * - Fog white-warm:      #e8dcc4
 * - Sky (rare, top):     #4a7a6a
 */

export const PALETTE = {
  deepShadow: '#0a1f1a',
  midForest: '#1a3d2e',
  mossAccent: '#2d5a4a',
  sunRayGold: '#c9a961',
  warmAmber: '#ffb347',
  fireflyLime: '#d4ff7a',
  spiritCyan: '#7fffcf',
  fogWhiteWarm: '#e8dcc4',
  skyTop: '#4a7a6a',
} as const;

// Normalized RGB vectors for WebGL shaders
export const SHADER_COLORS = {
  deepShadow: [0.0392, 0.1216, 0.1020] as const, // #0a1f1a
  midForest: [0.1020, 0.2392, 0.1804] as const,  // #1a3d2e
  mossAccent: [0.1765, 0.3529, 0.2902] as const, // #2d5a4a
  sunRayGold: [0.7882, 0.6627, 0.3804] as const, // #c9a961
  warmAmber: [1.0000, 0.7020, 0.2784] as const,  // #ffb347
  fireflyLime: [0.8314, 1.0000, 0.4784] as const,// #d4ff7a
  spiritCyan: [0.4980, 1.0000, 0.8118] as const, // #7fffcf
  fogWhiteWarm: [0.9098, 0.8627, 0.7686] as const,// #e8dcc4
  skyTop: [0.2902, 0.4784, 0.4157] as const,     // #4a7a6a
};
