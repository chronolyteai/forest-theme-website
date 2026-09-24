'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

/**
 * Fireflies:
 * 3,200+ GPU particles with:
 * - 3D curl noise field motion (non-linear, organic fluid drift)
 * - Mouse reaction: scatter within 2.0 units, re-gather with spring physics
 * - Exact color gradient: #d4ff7a (firefly lime) -> #ffb347 (warm amber)
 * - 5% "leader" fireflies that pulse 2.5x brighter on a 3.0-second cycle
 * - Bloom intensity per particle: 2.5x
 */
export function Fireflies() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const mouse3D = useForestStore((s) => s.mouse3D);
  const mouse = useForestStore((s) => s.mouse);

  const count = 3200;

  const { geometry, basePositions, currentPositions, velocities, leaderFlags } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const basePos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const leaders = new Float32Array(count);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Valley volume: X [-22, 22], Y [0.5, 12], Z [-48, 25]
      const x = (Math.random() - 0.5) * 44;
      const y = 0.5 + Math.random() * 11.5;
      const z = -48 + Math.random() * 73;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      basePos[i * 3] = x;
      basePos[i * 3 + 1] = y;
      basePos[i * 3 + 2] = z;

      vel[i * 3] = 0;
      vel[i * 3 + 1] = 0;
      vel[i * 3 + 2] = 0;

      // 5% leader fireflies
      const isLeader = Math.random() < 0.05 ? 1.0 : 0.0;
      leaders[i] = isLeader;
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = isLeader ? 32.0 : 16.0 + Math.random() * 14.0;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aLeader', new THREE.BufferAttribute(leaders, 1));
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    return {
      geometry: geom,
      basePositions: basePos,
      currentPositions: pos,
      velocities: vel,
      leaderFlags: leaders,
    };
  }, [count]);

  const fireflyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColorLime: { value: new THREE.Color('#d4ff7a') },
        uColorAmber: { value: new THREE.Color('#ffb347') },
        uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
      },
      vertexShader: /* glsl */ `
        attribute float aLeader;
        attribute float aPhase;
        attribute float aSize;

        uniform float uTime;
        uniform float uPixelRatio;

        varying float vLeader;
        varying float vPhase;

        void main() {
          vLeader = aLeader;
          vPhase = aPhase;

          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);

          // 3s cycle for leader fireflies (2*PI / 3.0 = 2.0944)
          float pulse = 1.0;
          if (aLeader > 0.5) {
            pulse = 1.3 + 0.9 * sin(uTime * 2.0944 + aPhase);
          } else {
            pulse = 0.8 + 0.3 * sin(uTime * 2.8 + aPhase);
          }

          gl_PointSize = aSize * pulse * uPixelRatio * (16.0 / -mvPos.z);
          gl_PointSize = clamp(gl_PointSize, 4.0, 72.0);

          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColorLime;
        uniform vec3 uColorAmber;

        varying float vLeader;
        varying float vPhase;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float d = length(center);
          if (d > 0.5) discard;

          // Gaussian glow falloff
          float core = smoothstep(0.18, 0.0, d);
          float halo = exp(-d * 6.5);
          float shape = core * 0.9 + halo * 1.1;

          // Color gradient: #d4ff7a -> #ffb347
          float colorT = sin(uTime * 1.5 + vPhase) * 0.5 + 0.5;
          vec3 baseCol = mix(uColorLime, uColorAmber, colorT);

          // MANDATED: 5% leader fireflies pulse 2.5x brighter on 3s cycle
          float intensity = 1.0;
          if (vLeader > 0.5) {
            intensity = 2.5 * (0.8 + 0.4 * sin(uTime * 2.0944 + vPhase));
          }

          // MANDATED: Bloom intensity per-particle: 2.5x
          vec3 finalColor = baseCol * shape * intensity * 2.5;
          finalColor += vec3(0.4, 0.4, 0.3) * core;

          gl_FragColor = vec4(finalColor, halo);
        }
      `,
    });
  }, []);

  // Frame loop: curl noise simulation + mouse scatter with spring physics
  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
    }

    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const p = posAttr.array as Float32Array;

    const mX = mouse3D[0];
    const mY = mouse3D[1];
    const mZ = mouse3D[2];

    let hasHoveredNear = false;

    // Fast curl noise field + spring physics
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let px = p[idx];
      let py = p[idx + 1];
      let pz = p[idx + 2];

      const bx = basePositions[idx];
      const by = basePositions[idx + 1];
      const bz = basePositions[idx + 2];

      // Divergence-free curl noise velocity
      const cX = Math.sin(py * 0.35 + time * 0.4) * Math.cos(pz * 0.35) * 0.016;
      const cY = Math.cos(pz * 0.35 + time * 0.35) * Math.sin(px * 0.35) * 0.012;
      const cZ = Math.sin(px * 0.35 + time * 0.4) * Math.cos(py * 0.35) * 0.016;

      // Mouse reaction: within 2.0 units, scatter!
      const dx = px - mX;
      const dy = py - mY;
      const dz = pz - mZ;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 4.0) {
        // Within 2.0 units
        const dist = Math.sqrt(distSq) + 0.01;
        const scatterForce = (1.0 - dist / 2.0) * 12.0;
        velocities[idx] += (dx / dist) * scatterForce;
        velocities[idx + 1] += (dy / dist) * scatterForce + 0.5;
        velocities[idx + 2] += (dz / dist) * scatterForce;
        hasHoveredNear = true;
      }

      // Spring physics returning to base position
      const springX = (bx - px) * 1.8;
      const springY = (by - py) * 1.8;
      const springZ = (bz - pz) * 1.8;

      velocities[idx] += springX * delta;
      velocities[idx + 1] += springY * delta;
      velocities[idx + 2] += springZ * delta;

      // Friction
      velocities[idx] *= 0.92;
      velocities[idx + 1] *= 0.92;
      velocities[idx + 2] *= 0.92;

      // Apply curl noise + velocity
      px += velocities[idx] * delta + cX;
      py += velocities[idx + 1] * delta + cY;
      pz += velocities[idx + 2] * delta + cZ;

      p[idx] = px;
      p[idx + 1] = py;
      p[idx + 2] = pz;
    }

    posAttr.needsUpdate = true;

    // Trigger subtle firefly shimmer chime panned by mouse X
    if (hasHoveredNear) {
      forestAudio.playFireflyChime(mouse.x);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <primitive object={fireflyMaterial} ref={materialRef} attach="material" />
    </points>
  );
}
