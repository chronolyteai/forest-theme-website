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
  scrollProgress: number;
  currentSection: number;
  isMuted: boolean;
  audioEnergy: number;
  mouse: {
    x: number; // -1 to 1
    y: number; // -1 to 1
    rawX: number;
    rawY: number;
  };
  mouse3D: [number, number, number];
  burstEvent: BurstEvent | null;
  cameraFov: number;
  screenShake: number;
  isMobile: boolean;

  // Actions
  setLoadingProgress: (val: number | ((prev: number) => number)) => void;
  setIsLoaded: (loaded: boolean) => void;
  setScrollProgress: (progress: number) => void;
  setCurrentSection: (section: number) => void;
  toggleMute: () => void;
  setIsMuted: (muted: boolean) => void;
  setAudioEnergy: (val: number) => void;
  setMouse: (x: number, y: number, rawX?: number, rawY?: number) => void;
  setMouse3D: (pos: [number, number, number]) => void;
  triggerBurst: (x?: number, y?: number, z?: number) => void;
  triggerScreenShake: (amount?: number) => void;
  decayScreenShake: (delta: number) => void;
  setCameraFov: (fov: number) => void;
  setIsMobile: (mobile: boolean) => void;
}

export const useForestStore = create<ForestState>((set, get) => ({
  loadingProgress: 0,
  isLoaded: false,
  scrollProgress: 0,
  currentSection: 0,
  isMuted: true,
  audioEnergy: 0.35,
  mouse: { x: 0, y: 0, rawX: 0, rawY: 0 },
  mouse3D: [0, 2, -6],
  burstEvent: null,
  cameraFov: 35,
  screenShake: 0,
  isMobile: false,

  setLoadingProgress: (val) =>
    set((state) => ({
      loadingProgress: typeof val === 'function' ? val(state.loadingProgress) : val,
    })),

  setIsLoaded: (loaded) => set({ isLoaded: loaded }),

  setScrollProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress));
    let section = 0;
    if (clamped >= 0.75) section = 3;
    else if (clamped >= 0.45) section = 2;
    else if (clamped >= 0.18) section = 1;
    else section = 0;

    const prevSection = get().currentSection;
    if (section !== prevSection) {
      // Subtle FOV push (35 -> 32 -> 35) on section transition
      set({ cameraFov: 32, screenShake: 0.25, currentSection: section });
      setTimeout(() => set({ cameraFov: 35 }), 600);
    } else {
      set({ scrollProgress: clamped, currentSection: section });
    }
  },

  setCurrentSection: (section) => set({ currentSection: section }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setIsMuted: (muted) => set({ isMuted: muted }),
  setAudioEnergy: (val) => set({ audioEnergy: val }),
  setMouse: (x, y, rawX, rawY) =>
    set((state) => ({
      mouse: {
        x,
        y,
        rawX: rawX !== undefined ? rawX : state.mouse.rawX,
        rawY: rawY !== undefined ? rawY : state.mouse.rawY,
      },
    })),
  setMouse3D: (pos) => set({ mouse3D: pos }),
  triggerBurst: (x = 0, y = 2, z = -6) =>
    set({
      burstEvent: {
        x,
        y,
        z,
        time: performance.now(),
        id: Math.random(),
      },
    }),
  triggerScreenShake: (amount = 0.3) => set({ screenShake: amount }),
  decayScreenShake: (delta) =>
    set((state) => {
      if (state.screenShake <= 0.001) return { screenShake: 0 };
      return { screenShake: Math.max(0, state.screenShake - delta * 2.0) };
    }),
  setCameraFov: (fov) => set({ cameraFov: fov }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
}));
