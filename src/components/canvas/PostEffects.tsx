'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  ChromaticAberration,
  Vignette,
  Noise,
  SMAA,
  wrapEffect,
} from '@react-three/postprocessing';
import { Effect, BlendFunction } from 'postprocessing';
import { useForestStore } from '@/store/useForestStore';

/**
 * Custom Color Grading Effect:
 * Exact specifications:
 * - Teal shadows (#0a1f1a)
 * - Amber highlights (#ffb347)
 * - Slight S-curve contrast
 * - Saturation 1.15
 */
const colorGradingShader = /* glsl */ `
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 c = inputColor.rgb;

    // 1. Slight S-curve contrast
    c = c * c * (3.0 - 2.0 * c);

    // 2. Saturation 1.15
    float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(luma), c, 1.15);

    // 3. Teal shadows (#0a1f1a), Amber highlights (#ffb347)
    vec3 tealShadow = vec3(0.0392, 0.1216, 0.1020);
    vec3 amberHighlight = vec3(1.0000, 0.7020, 0.2784);

    float shadowMask = clamp(1.0 - luma * 1.8, 0.0, 1.0);
    float highlightMask = clamp(pow(luma, 1.6), 0.0, 1.0);

    c = mix(c, tealShadow, shadowMask * 0.22);
    c += amberHighlight * highlightMask * 0.18;

    outputColor = vec4(c, inputColor.a);
  }
`;

class ColorGradingImpl extends Effect {
  constructor() {
    super('ColorGradingEffect', colorGradingShader, {
      blendFunction: BlendFunction.NORMAL,
    });
  }
}

// Wrap with any for React 18 JSX compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ColorGrading = wrapEffect(ColorGradingImpl) as any;

/**
 * PostEffects:
 * Mandated 7-layer post-processing stack in EXACT ORDER:
 * 1. Bloom: intensity 1.8, luminanceThreshold 0.35, mipmapBlur true
 * 2. Depth of Field: focusDistance 0.02, focalLength 0.05, bokehScale 6
 * 3. Chromatic Aberration: offset [0.0008, 0.0008], radial modulation
 * 4. Vignette: darkness 0.7, offset 0.3
 * 5. Film Grain: intensity 0.08, animated
 * 6. Color grading: teal shadows, amber highlights, S-curve contrast, sat 1.15
 * 7. SMAA antialiasing (final pass)
 */
export function PostEffects() {
  const isMobile = useForestStore((s) => s.isMobile);

  const chromaOffset = useMemo(() => new THREE.Vector2(0.0008, 0.0008), []);

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* 1. Bloom */}
      <Bloom
        intensity={1.8}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.65}
        mipmapBlur={true}
      />

      {/* 2. Depth of Field (disabled on mobile for 60fps rule) */}
      {!isMobile ? (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={6.0}
        />
      ) : (
        <></>
      )}

      {/* 3. Chromatic Aberration */}
      <ChromaticAberration
        offset={chromaOffset}
        radialModulation={true}
        modulationOffset={0.3}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 4. Vignette */}
      <Vignette
        darkness={0.7}
        offset={0.3}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 5. Film Grain */}
      <Noise
        opacity={0.08}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* 6. Color Grading (Teal shadows, Amber highlights, S-curve contrast, Sat 1.15) */}
      <ColorGrading />

      {/* 7. SMAA Antialiasing (Final pass) */}
      <SMAA />
    </EffectComposer>
  );
}
