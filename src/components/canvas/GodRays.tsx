'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glslNoise3D } from '@/utils/noise';

/**
 * GodRays:
 * 16 distinct volumetric sun shafts piercing through dense canopy gaps.
 * - Pulsing intensity driven by Perlin noise
 * - Intersects naturally with the volumetric fog volume
 * - Colors: #c9a961 (sun ray gold), #ffb347 (warm amber)
 */
export function GodRays() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // 16 distinct ray shaft transforms angling down from the canopy
  const shafts = useMemo(() => {
    return [
      { pos: [6, 20, -18], rot: [0.68, -0.38, 0.32], scale: [3.6, 30, 3.6], pulsePhase: 0.0 },
      { pos: [-2, 21, -12], rot: [0.72, -0.32, 0.28], scale: [3.2, 28, 3.2], pulsePhase: 1.2 },
      { pos: [10, 22, -22], rot: [0.62, -0.42, 0.38], scale: [4.2, 32, 4.2], pulsePhase: 2.4 },
      { pos: [-7, 19, -6], rot: [0.76, -0.24, 0.22], scale: [2.8, 26, 2.8], pulsePhase: 0.8 },
      { pos: [2, 21, 2], rot: [0.70, -0.35, 0.30], scale: [3.4, 28, 3.4], pulsePhase: 3.1 },
      { pos: [8, 19, 8], rot: [0.65, -0.40, 0.35], scale: [3.0, 26, 3.0], pulsePhase: 1.7 },
      { pos: [-4, 20, 14], rot: [0.74, -0.28, 0.25], scale: [2.6, 25, 2.6], pulsePhase: 2.8 },
      { pos: [12, 22, -8], rot: [0.64, -0.36, 0.34], scale: [3.8, 30, 3.8], pulsePhase: 0.5 },
      { pos: [-10, 18, -16], rot: [0.78, -0.22, 0.20], scale: [2.8, 27, 2.8], pulsePhase: 1.9 },
      { pos: [4, 20, -28], rot: [0.66, -0.39, 0.33], scale: [3.5, 31, 3.5], pulsePhase: 3.6 },
      { pos: [-1, 22, -34], rot: [0.71, -0.30, 0.27], scale: [3.2, 30, 3.2], pulsePhase: 2.1 },
      { pos: [14, 21, -32], rot: [0.61, -0.44, 0.39], scale: [4.0, 33, 4.0], pulsePhase: 0.3 },
      { pos: [-8, 19, 6], rot: [0.75, -0.26, 0.23], scale: [2.5, 24, 2.5], pulsePhase: 1.4 },
      { pos: [5, 20, 18], rot: [0.67, -0.37, 0.31], scale: [2.9, 25, 2.9], pulsePhase: 2.9 },
      { pos: [-3, 19, 22], rot: [0.73, -0.29, 0.26], scale: [2.4, 23, 2.4], pulsePhase: 0.9 },
      { pos: [9, 21, -2], rot: [0.65, -0.39, 0.34], scale: [3.3, 28, 3.3], pulsePhase: 3.4 },
    ] as Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      scale: [number, number, number];
      pulsePhase: number;
    }>;
  }, []);

  const shaftGeometry = useMemo(() => {
    // Open-ended tapered cylinder: top 0.35, bottom 2.6, height 1
    const geom = new THREE.CylinderGeometry(0.35, 2.6, 1, 24, 16, true);
    geom.translate(0, -0.5, 0); // Origin at top of ray (canopy opening)
    return geom;
  }, []);

  const shaftMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uRayGold: { value: new THREE.Color('#c9a961') },
        uRayAmber: { value: new THREE.Color('#ffb347') },
        uRayCore: { value: new THREE.Color('#fff4d6') },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uRayGold;
        uniform vec3 uRayAmber;
        uniform vec3 uRayCore;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        ${glslNoise3D}

        void main() {
          float t = vUv.y; // 0.0 top to 1.0 bottom

          // Perlin noise mask animating through the ray shaft
          vec3 noiseCoord = vWorldPos * 0.09 + vec3(uTime * 0.035, -uTime * 0.065, uTime * 0.02);
          float n1 = snoise(noiseCoord);
          float n2 = snoise(noiseCoord * 2.4 - vec3(0.0, uTime * 0.09, 0.0)) * 0.4;
          float dustMask = (n1 + n2) * 0.4 + 0.6;

          // Radial falloff: beam brightest along central axis
          float radialEdge = sin(vUv.x * 3.14159265);
          radialEdge = pow(radialEdge, 1.6);

          // Top canopy fade and bottom floor fade
          float lengthFade = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.72, t);

          // Perlin-driven pulsing intensity
          float pulse = 0.85 + 0.25 * sin(uTime * 1.8 + vWorldPos.x * 0.15 + vWorldPos.z * 0.1);

          float density = dustMask * radialEdge * lengthFade * pulse;

          // Color gradient: Core gold-white -> Sun ray gold (#c9a961) -> Warm amber (#ffb347)
          vec3 col = mix(uRayCore, uRayGold, t * 0.6);
          col = mix(col, uRayAmber, pow(t, 2.0) * 0.6);

          float alpha = density * 0.48;

          gl_FragColor = vec4(col * alpha * 2.2, alpha);
        }
      `,
    });
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <group>
      {shafts.map((shaft, i) => (
        <mesh
          key={`godray-${i}`}
          geometry={shaftGeometry}
          material={shaftMaterial}
          position={shaft.pos}
          rotation={shaft.rot}
          scale={shaft.scale}
        />
      ))}
    </group>
  );
}
