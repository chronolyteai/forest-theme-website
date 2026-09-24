'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glslNoise3D } from '@/utils/noise';

/**
 * VolumetricLightRays:
 * Golden hour god rays piercing through gaps in the dense forest canopy.
 * Features:
 * - Multi-shaft volumetric cones with additive blending
 * - Animated Simplex 3D noise simulating drifting atmospheric haze and light dust
 * - Soft edge falloff and warm golden amber color gradient
 */
export function VolumetricLightRays() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Configuration for 7 distinct dramatic sunbeams piercing the canopy
  const rays = useMemo(() => {
    return [
      { pos: [4, 18, -12], rot: [0.65, -0.4, 0.35], scale: [3.8, 28, 3.8], intensity: 1.0 },
      { pos: [-3, 19, -8], rot: [0.72, -0.3, 0.28], scale: [3.2, 26, 3.2], intensity: 0.85 },
      { pos: [9, 21, -16], rot: [0.6, -0.45, 0.4], scale: [4.5, 32, 4.5], intensity: 1.1 },
      { pos: [-8, 17, -4], rot: [0.75, -0.22, 0.22], scale: [3.0, 24, 3.0], intensity: 0.7 },
      { pos: [1, 20, 2], rot: [0.68, -0.35, 0.32], scale: [3.5, 27, 3.5], intensity: 0.9 },
      { pos: [6, 18, 8], rot: [0.62, -0.38, 0.36], scale: [3.2, 25, 3.2], intensity: 0.8 },
      { pos: [-5, 19, 14], rot: [0.7, -0.28, 0.26], scale: [2.8, 24, 2.8], intensity: 0.75 },
    ] as Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      scale: [number, number, number];
      intensity: number;
    }>;
  }, []);

  // Geometry: Cone tapering from 0.4 at source (top) to 2.2 at forest floor
  const rayGeometry = useMemo(() => {
    // top radius 0.4, bottom radius 2.4, height 1, radial segments 24, open-ended
    const geom = new THREE.CylinderGeometry(0.3, 2.4, 1, 24, 16, true);
    geom.translate(0, -0.5, 0); // Origin at top of ray (where it enters canopy)
    return geom;
  }, []);

  // Custom Volumetric Light Ray Shader
  const rayMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uRayColorCore: { value: new THREE.Color('#fff2cf') },
        uRayColorAmber: { value: new THREE.Color('#f59e0b') },
        uRayColorFade: { value: new THREE.Color('#0d4233') },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorldPos;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uRayColorCore;
        uniform vec3 uRayColorAmber;
        uniform vec3 uRayColorFade;

        varying vec3 vWorldPos;
        varying vec2 vUv;
        varying vec3 vNormal;

        ${glslNoise3D}

        void main() {
          // Height along ray (0.0 at top/canopy, 1.0 at ground)
          float t = vUv.y;

          // Atmospheric dust noise flowing through the light beam
          vec3 noiseCoord = vWorldPos * 0.08 + vec3(uTime * 0.04, -uTime * 0.06, uTime * 0.03);
          float n1 = snoise(noiseCoord);
          float n2 = snoise(noiseCoord * 2.2 - vec3(0.0, uTime * 0.08, 0.0)) * 0.5;
          float dustHaze = (n1 + n2) * 0.35 + 0.65;

          // Radial falloff: beam is brightest along axis and soft at circumference
          float radialEdge = sin(vUv.x * 3.14159265);
          radialEdge = pow(radialEdge, 1.4);

          // Top and bottom longitudinal fade
          float lengthFade = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.7, t);

          // Combine density
          float density = dustHaze * radialEdge * lengthFade;

          // Color gradient: brilliant golden-white core -> rich amber -> soft emerald dusk
          vec3 col = mix(uRayColorCore, uRayColorAmber, t * 0.8);
          col = mix(col, uRayColorFade, pow(t, 2.0) * 0.5);

          // Intensity modulation
          float alpha = density * 0.42;

          gl_FragColor = vec4(col * alpha * 1.8, alpha);
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
      {rays.map((ray, i) => (
        <mesh
          key={`ray-${i}`}
          geometry={rayGeometry}
          material={rayMaterial}
          position={ray.pos}
          rotation={ray.rot}
          scale={ray.scale}
        />
      ))}
    </group>
  );
}
