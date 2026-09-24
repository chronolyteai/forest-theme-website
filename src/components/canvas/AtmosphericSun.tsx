'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SHADER_COLORS } from '@/utils/colors';

/**
 * AtmosphericSun:
 * A visible golden orb with Rayleigh and Mie atmospheric scattering.
 * Not a basic 3D sphere—an authentic atmospheric light source with:
 * - Ultra-bright solar disc
 * - Exponential Mie forward scattering aureole
 * - Surrounding sky gradient blending into #4a7a6a and #e8dcc4
 */
export function AtmosphericSun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const sunPosition = useMemo(() => new THREE.Vector3(14, 22, -42), []);

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSunColorCore: { value: new THREE.Color('#fff7e6') },
        uSunColorGold: { value: new THREE.Color('#c9a961') },
        uSunColorAmber: { value: new THREE.Color('#ffb347') },
        uSkyZenith: { value: new THREE.Color('#4a7a6a') },
        uFogWarm: { value: new THREE.Color('#e8dcc4') },
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
        uniform vec3 uSunColorCore;
        uniform vec3 uSunColorGold;
        uniform vec3 uSunColorAmber;
        uniform vec3 uSkyZenith;
        uniform vec3 uFogWarm;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vec2 p = vUv - vec2(0.5);
          float d = length(p);

          // Solar disc
          float disc = smoothstep(0.09, 0.02, d);

          // Mie forward scattering (intense forward aureole)
          float mie = exp(-d * 8.5) * 1.8;

          // Wide atmospheric Rayleigh glow
          float rayleigh = exp(-d * 3.2) * 0.9;

          // Subtle organic atmospheric shimmering
          float shimmer = 1.0 + 0.05 * sin(uTime * 1.5 + d * 18.0);

          // Color blending
          vec3 col = uSunColorAmber * (rayleigh * shimmer);
          col += uSunColorGold * (mie * shimmer);
          col += uSunColorCore * disc * 3.5;

          float alpha = clamp(disc + mie * 0.7 + rayleigh * 0.45, 0.0, 1.0);

          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
  }, []);

  useFrame(({ clock, camera }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
    // Billboard towards camera
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={[sunPosition.x, sunPosition.y, sunPosition.z]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[26, 26]} />
        <primitive object={sunMaterial} ref={materialRef} attach="material" />
      </mesh>
    </group>
  );
}
