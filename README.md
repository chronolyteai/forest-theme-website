# Sylvane — Cinematic 3D Forest Experience

An Awwwards Site of the Year showcase-caliber, scroll-driven 3D ancient forest built with **Next.js 14 (App Router)**, **TypeScript**, **Three.js**, **React Three Fiber (@react-three/fiber)**, **Drei (@react-three/drei)**, and custom GLSL shaders.

Designed to captivate viewers within the first 2 seconds with cinematic volumetric god rays, bioluminescent fireflies, wind-swayed ancient redwoods, and a reflective mountain stream.

---

## Live Preview & Demo

- **Local Preview**: `http://localhost:3000`
- **One-Click Deploy**: Deployable directly to **Vercel** with zero extra configuration.

---

## Key Features & Visual Systems

### 1. Mystical Golden-Hour Forest Atmosphere
- **Foggy ancient woods**: Exponential depth fog blending deep emerald greens (`#051912`), cool teal shadow tones (`#0d3238`), and warm amber sun highlights (`#fcd34d`).
- **Volumetric God Rays**: Piercing light shafts animated with 3D Simplex noise to simulate drifting forest dust, pollen, and morning haze with additive blending.
- **Aurora Ground Mist**: Multi-layered horizontal creeping fog planes that shift gracefully between deep river teal, moss jade, and twilight purple.

### 2. Real-Time Reflective Stream
- Powered by **Drei's `MeshReflectorMaterial`**, dynamically reflecting towering tree trunks, light beams, and the celestial spirit stag.
- Real-time procedural water ripple normal map generated at 60fps to distort reflections organically with wave interference patterns.

### 3. Realistic Wind-Sway Trees & Hover Shimmer
- Over **140+ instanced redwood trunks** and **multi-tiered foliage clusters**.
- Inline GLSL vertex shader computing natural wind sway based on tree height and world position.
- Interactive leaf shimmer: hovering over the canopy sends a glistening wave of golden-emerald specular highlights across the foliage.

### 4. Bioluminescent Celestial Stag & Ethereal Heartbeat
- A sacred spirit stag guardian standing in the shallow stream.
- Translucent Fresnel spirit shader with iridescent rim glow.
- Concentric ethereal rings orbiting the stag.
- Pulsating energy aura and point light synchronized with real-time audio energy from the Web Audio API soundscape.

### 5. Reactive Firefly System & Constellations
- Over **2,400 bioluminescent particles** floating organically through the forest corridor.
- Responsive to cursor movement (repulsion and fluid swirling).
- **Interactive Burst**: Clicking anywhere in the 3D scene triggers an energetic particle shockwave and a glistening crystal chime.
- **Constellation Formation**: In Chapter 03 (*Canopy Echoes*), hundreds of fireflies converge to form an ethereal sacred antler/tree constellation before dispersing.

### 6. Physics-Lite Falling Leaves
- 320 stylized leaves tumbling gently down through the light beams with realistic 3-axis rotational fluttering and wind drift.

### 7. Cinematic Post-Processing
- **Selective Bloom**: Golden ethereal radiance around light beams, fireflies, and the celestial stag.
- **Depth of Field**: Anamorphic bokeh separating the foreground glade from distant canopy depth.
- **Chromatic Aberration**: Optical lens dispersion.
- **Audio-Reactive Vignette**: Framing darkness that pulses subtly with the forest's breath.

### 8. Web Audio API Ambient Soundscape Engine
- 100% in-browser procedural sound generation (no external MP3 dependencies):
  - Filtered pink-noise shallow mountain stream with dual LFO modulation.
  - Canopy wind gusts.
  - Distant frequency-modulated songbird chirps at organic randomized intervals.
  - Warm 55Hz/110Hz detuned sanctuary drone.
  - Pentatonic crystal chime bursts on user click.
  - Real-time FFT frequency analyser driving scene pulsation.

---

## Scroll-Driven Storyline

1. **Chapter 01: HERO — "Enter the Wild"**
   - Letter-by-letter cinematic stagger reveal.
   - Camera slowly pushing through the ancient mossy archway trees.
2. **Chapter 02: ABOUT — "The Living Sanctuary"**
   - Camera swoops low over the reflective stream.
   - Glassmorphic narrative panels float above the water reflections.
3. **Chapter 03: FEATURES — "Echoes of the Canopy"**
   - Fireflies converge into a celestial constellation in the glade.
   - Interactive feature cards spotlighting shader mechanics.
4. **Chapter 04: CTA — "Let's Build Your World"**
   - Sweeping dusk crane shot revealing the whole glowing forest canopy.
   - Pulsing climax typography and interactive project beacon modal.

---

## Extra Polish & Micro-Interactions

- **Animated Growing SVG Forest Silhouette**: Roots sprout, trunks climb, and canopy crowns bloom in elegant synchrony during asset load.
- **Growing Vine Scroll Indicator**: An organic SVG vine stem that unfurls down the screen, with glowing leaf nodes marking the chapters.
- **Custom Spore Trail Cursor**: Fluid golden-emerald spore particles trailing behind cursor movements.
- **Section Transition Screen Shake**: Subtle camera and DOM impulse when crossing chapter thresholds.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 14** (App Router) | React framework & static optimization |
| **TypeScript** | Type safety & strict interfaces |
| **Three.js** | Core WebGL engine |
| **React Three Fiber (@react-three/fiber)** | Declarative 3D scene graph |
| **Drei (@react-three/drei)** | 3D helpers & `MeshReflectorMaterial` |
| **Postprocessing** | Cinematic bloom, bokeh DOF, vignette |
| **GSAP & Framer Motion** | Scroll triggers & letter-by-letter text reveals |
| **Tailwind CSS** | Minimal glassmorphism UI overlay |
| **Zustand** | Central reactive state & audio energy store |

---

## Development & Build

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript type check
npm run typecheck

# Build for production
npm run build

# Start production server
npm run start
```
