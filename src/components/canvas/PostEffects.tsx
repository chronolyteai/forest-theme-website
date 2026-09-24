'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useForestStore } from '@/store/useForestStore';

/**
 * PostEffects:
 * Awwwards-caliber cinematic post-processing pipeline:
 * - Selective Bloom: Creates the ethereal golden glow around light shafts, fireflies, and the spirit deer
 * - Depth of Field: Cinematic focal blur separating foreground ferns/trunks from mystical background glades
 * - Chromatic Aberration: Subtle edge color dispersion simulating anamorphic cinema optics
 * - Vignette: Framing darkness that subtly pulses with the ambient forest audio heartbeat
 */
export function PostEffects() {
  const audioEnergy = useForestStore((s) => s.audioEnergy);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vignetteRef = useRef<any>(null);

  // Animate vignette darkness in frame loop with audio energy
  useFrame((_, delta) => {
    if (vignetteRef.current) {
      const targetDarkness = 0.65 + audioEnergy * 0.18;
      vignetteRef.current.darkness = THREE.MathUtils.damp(
        vignetteRef.current.darkness,
        targetDarkness,
        3.0,
        delta
      );
    }
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.52}
        luminanceSmoothing={0.65}
        intensity={1.25}
        mipmapBlur
      />
      <DepthOfField
        focusDistance={0.018}
        focalLength={0.065}
        bokehScale={2.2}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0012, 0.0012)}
        radialModulation={true}
        modulationOffset={0.35}
      />
      <Vignette
        ref={vignetteRef}
        offset={0.38}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
