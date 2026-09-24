import { create } from 'zustand';

interface BurstEvent {
  x: number;
  y: number;
  z: number;
  time: number;
  id: number;
}

interface ForestState {
  loadingProgress: number;
  isLoaded: boolean;
  scrollProgress: number; // 0 to 1 across all 4 sections
  currentSection: number; // 0: Hero, 1: About, 2: Features, 3: CTA
  isMuted: boolean;
  audioEnergy: number; // 0 to 1, rhythmic pulse for the spirit orb & vignette
  mouse: {
    x: number; // -1 to 1
    y: number; // -1 to 1
    rawX: number;
    rawY: number;
  };
  hoveredTree: boolean;
  burstEvent: BurstEvent | null;
  screenShake: number; // decayed in render loop
  isContactModalOpen: boolean;
  qualityTier: 'high' | 'medium' | 'low';

  // Actions
  setLoadingProgress: (val: number | ((prev: number) => number)) => void;
  setIsLoaded: (loaded: boolean) => void;
  setScrollProgress: (progress: number) => void;
  setCurrentSection: (section: number) => void;
  toggleMute: () => void;
  setIsMuted: (muted: boolean) => void;
  setAudioEnergy: (energy: number) => void;
  setMouse: (x: number, y: number, rawX?: number, rawY?: number) => void;
  setHoveredTree: (hovered: boolean) => void;
  triggerBurst: (x?: number, y?: number, z?: number) => void;
  triggerScreenShake: (amount?: number) => void;
  decayScreenShake: (delta: number) => void;
  setContactModalOpen: (open: boolean) => void;
  setQualityTier: (tier: 'high' | 'medium' | 'low') => void;
}

export const useForestStore = create<ForestState>((set, get) => ({
  loadingProgress: 0,
  isLoaded: false,
  scrollProgress: 0,
  currentSection: 0,
  isMuted: true,
  audioEnergy: 0.35,
  mouse: { x: 0, y: 0, rawX: 0, rawY: 0 },
  hoveredTree: false,
  burstEvent: null,
  screenShake: 0,
  isContactModalOpen: false,
  qualityTier: 'high',

  setLoadingProgress: (val) =>
    set((state) => ({
      loadingProgress: typeof val === 'function' ? val(state.loadingProgress) : val,
    })),

  setIsLoaded: (loaded) => set({ isLoaded: loaded }),

  setScrollProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress));
    // Determine section (0..3)
    let section = 0;
    if (clamped >= 0.75) section = 3;
    else if (clamped >= 0.45) section = 2;
    else if (clamped >= 0.18) section = 1;
    else section = 0;

    const prevSection = get().currentSection;
    if (section !== prevSection) {
      // Trigger subtle cinematic screen shake when entering a new section
      set({ screenShake: 0.35, currentSection: section });
    }

    set({ scrollProgress: clamped, currentSection: section });
  },

  setCurrentSection: (section) => set({ currentSection: section }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setIsMuted: (muted) => set({ isMuted: muted }),

  setAudioEnergy: (energy) => set({ audioEnergy: energy }),

  setMouse: (x, y, rawX, rawY) =>
    set((state) => ({
      mouse: {
        x,
        y,
        rawX: rawX !== undefined ? rawX : state.mouse.rawX,
        rawY: rawY !== undefined ? rawY : state.mouse.rawY,
      },
    })),

  setHoveredTree: (hovered) => set({ hoveredTree: hovered }),

  triggerBurst: (x = 0, y = 2, z = -5) =>
    set({
      burstEvent: {
        x,
        y,
        z,
        time: performance.now(),
        id: Math.random(),
      },
    }),

  triggerScreenShake: (amount = 0.4) => set({ screenShake: amount }),

  decayScreenShake: (delta) =>
    set((state) => {
      if (state.screenShake <= 0.001) return { screenShake: 0 };
      return { screenShake: Math.max(0, state.screenShake - delta * 2.2) };
    }),

  setContactModalOpen: (open) => set({ isContactModalOpen: open }),

  setQualityTier: (tier) => set({ qualityTier: tier }),
}));
