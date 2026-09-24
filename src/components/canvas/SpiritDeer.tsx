'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useForestStore } from '@/store/useForestStore';

/**
 * SpiritDeer:
 * Glowing celestial deer-like silhouette made entirely of PARTICLES (not a mesh).
 * - Particles form the silhouette via parametric SDF sampling of a stag
 * - Breathes: particles expand and contract on a 4.0s sine cycle
 * - When mouse approaches, particles swirl and reform with spring physics
 * - Emits soft light onto nearby trees (animated point light)
 * - Color: ethereal #7fffcf -> #ffffff core
 * - Hero section centerpiece
 */
export function SpiritDeer() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const mouse3D = useForestStore((s) => s.mouse3D);
  const scrollProgress = useForestStore((s) => s.scrollProgress);

  const particleCount = 2400;

  // Generate parametric deer silhouette point cloud
  const { geometry, basePositions, velocities } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const basePos = new Float32Array(particleCount * 3);
    const vels = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    let idx = 0;

    const addPoint = (x: number, y: number, z: number, s = 24.0) => {
      if (idx >= particleCount) return;
      pos[idx * 3] = x;
      pos[idx * 3 + 1] = y;
      pos[idx * 3 + 2] = z;

      basePos[idx * 3] = x;
      basePos[idx * 3 + 1] = y;
      basePos[idx * 3 + 2] = z;

      vels[idx * 3] = 0;
      vels[idx * 3 + 1] = 0;
      vels[idx * 3 + 2] = 0;

      sizes[idx] = s + Math.random() * 8.0;
      phases[idx] = Math.random() * Math.PI * 2;
      idx++;
    };

    // Center of stag: [0.2, 0.4, -7.5]
    // 1. Torso / Barrel (650 particles)
    for (let i = 0; i < 650; i++) {
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const r = 0.38 + Math.random() * 0.08;
      const zOffset = (u - 0.5) * 1.35;
      const x = Math.cos(theta) * (r * 0.75);
      const y = 1.3 + Math.sin(theta) * r;
      const z = zOffset;
      addPoint(x, y, z);
    }

    // 2. Chest & Rump curves (300 particles)
    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 0.42 * (0.8 + Math.random() * 0.2);
      addPoint(Math.sin(phi) * Math.cos(theta) * r, 1.4 + Math.cos(phi) * r, -0.65 + Math.sin(phi) * Math.sin(theta) * r * 0.5);
    }
    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 0.38 * (0.8 + Math.random() * 0.2);
      addPoint(Math.sin(phi) * Math.cos(theta) * r, 1.3 + Math.cos(phi) * r, 0.65 + Math.sin(phi) * Math.sin(theta) * r * 0.5);
    }

    // 3. Graceful Arched Neck & Noble Head (450 particles)
    for (let i = 0; i < 300; i++) {
      const t = i / 300;
      const theta = Math.random() * Math.PI * 2;
      const r = (0.24 - t * 0.09) * (0.85 + Math.random() * 0.3);
      const y = 1.45 + t * 0.95;
      const z = -0.6 - t * 0.55;
      const x = Math.cos(theta) * r;
      addPoint(x, y + Math.sin(theta) * r * 0.5, z);
    }
    for (let i = 0; i < 150; i++) {
      const t = i / 150;
      const r = (0.16 - t * 0.08) * (0.8 + Math.random() * 0.3);
      const theta = Math.random() * Math.PI * 2;
      addPoint(Math.cos(theta) * r, 2.4 + Math.sin(theta) * r * 0.7 - t * 0.15, -1.15 - t * 0.4);
    }

    // 4. Crown of Branching Antlers (600 particles)
    const branches = [
      // Left main beam
      { start: [-0.15, 2.5, -1.1], end: [-0.65, 3.45, -0.9], count: 120 },
      // Left tines
      { start: [-0.35, 2.8, -1.0], end: [-0.75, 3.0, -1.2], count: 60 },
      { start: [-0.45, 3.05, -0.95], end: [-0.85, 3.4, -0.8], count: 60 },
      { start: [-0.55, 3.3, -0.9], end: [-0.45, 3.65, -0.7], count: 60 },

      // Right main beam
      { start: [0.15, 2.5, -1.1], end: [0.65, 3.45, -0.9], count: 120 },
      // Right tines
      { start: [0.35, 2.8, -1.0], end: [0.75, 3.0, -1.2], count: 60 },
      { start: [0.45, 3.05, -0.95], end: [0.85, 3.4, -0.8], count: 60 },
      { start: [0.55, 3.3, -0.9], end: [0.45, 3.65, -0.7], count: 60 },
    ];

    branches.forEach((b) => {
      for (let i = 0; i < b.count; i++) {
        const t = i / b.count;
        const x = b.start[0] + (b.end[0] - b.start[0]) * t + (Math.random() - 0.5) * 0.04;
        const y = b.start[1] + (b.end[1] - b.start[1]) * t + (Math.random() - 0.5) * 0.04;
        const z = b.start[2] + (b.end[2] - b.start[2]) * t + (Math.random() - 0.5) * 0.04;
        addPoint(x, y, z, 28.0);
      }
    });

    // 5. Four Slender Legs (400 particles)
    const legOrigins = [
      { x: -0.22, z: -0.5 },
      { x: 0.22, z: -0.5 },
      { x: -0.24, z: 0.52 },
      { x: 0.24, z: 0.52 },
    ];
    legOrigins.forEach((leg) => {
      for (let i = 0; i < 100; i++) {
        const t = i / 100; // 0 at hip, 1 at hoof
        const y = 1.2 - t * 1.15;
        const r = (0.07 - t * 0.035) * (0.8 + Math.random() * 0.4);
        const theta = Math.random() * Math.PI * 2;
        addPoint(leg.x + Math.cos(theta) * r, y, leg.z + Math.sin(theta) * r);
      }
    });

    // Fill remaining points around heart core
    while (idx < particleCount) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.25;
      addPoint(Math.cos(theta) * r, 1.45 + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4, 30.0);
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    return {
      geometry: geom,
      basePositions: basePos,
      velocities: vels,
    };
  }, [particleCount]);

  // Shader Material for the Spirit Deer
  const deerMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCyanColor: { value: new THREE.Color('#7fffcf') },
        uWhiteCore: { value: new THREE.Color('#ffffff') },
        uOpacity: { value: 1.0 },
        uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;

        uniform float uTime;
        uniform float uPixelRatio;

        varying float vPhase;

        void main() {
          vPhase = aPhase;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);

          // Subtle twinkle
          float twinkle = 0.85 + 0.3 * sin(uTime * 3.5 + aPhase);
          gl_PointSize = aSize * twinkle * uPixelRatio * (14.0 / -mvPos.z);
          gl_PointSize = clamp(gl_PointSize, 3.0, 60.0);

          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCyanColor;
        uniform vec3 uWhiteCore;
        uniform float uOpacity;

        varying float vPhase;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float d = length(center);
          if (d > 0.5) discard;

          // Pure white core (#ffffff) -> Ethereal cyan glow (#7fffcf)
          float core = smoothstep(0.2, 0.0, d);
          float halo = exp(-d * 5.5);

          vec3 col = mix(uCyanColor, uWhiteCore, core);
          float alpha = (core * 0.95 + halo * 0.8) * uOpacity;

          gl_FragColor = vec4(col * alpha * 2.2, alpha);
        }
      `,
    });
  }, []);

  // Frame animation loop: 4-second breathing cycle + mouse approach swirl
  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      // Fade out smoothly if user scrolls deep into later sections
      const opacity = scrollProgress < 0.45 ? 1.0 : Math.max(0.0, 1.0 - (scrollProgress - 0.45) * 4.0);
      materialRef.current.uniforms.uOpacity.value = opacity;
    }

    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const p = posAttr.array as Float32Array;

    // MANDATED: Breathes on a 4-second sine cycle (2 * PI / 4.0 = 1.5708)
    const breath = Math.sin(time * 1.5708) * 0.06;

    // Animated point light emission onto nearby trees
    if (lightRef.current) {
      lightRef.current.intensity = 3.2 + Math.sin(time * 1.5708) * 1.6;
    }

    // Creature center in world space: [0.2, 0.5, -7.5]
    const stagCenterX = 0.2;
    const stagCenterY = 1.4;
    const stagCenterZ = -7.5;

    // Mouse distance to stag center
    const mDist = Math.hypot(mouse3D[0] - stagCenterX, mouse3D[1] - stagCenterY, mouse3D[2] - stagCenterZ);
    const isMouseNear = mDist < 2.5;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      let px = p[idx];
      let py = p[idx + 1];
      let pz = p[idx + 2];

      const bx = basePositions[idx];
      const by = basePositions[idx + 1];
      const bz = basePositions[idx + 2];

      // Radial expansion/contraction from breath
      const rx = bx;
      const ry = by - 1.35;
      const rz = bz;
      const targetX = bx + rx * breath;
      const targetY = by + ry * breath;
      const targetZ = bz + rz * breath;

      // Mouse approach: particles swirl outwards along curl vectors
      if (isMouseNear) {
        const swirlAngle = time * 2.2 + i * 0.02;
        const swirlForce = (1.0 - mDist / 2.5) * 4.5;
        velocities[idx] += Math.sin(swirlAngle) * swirlForce * delta * 8.0;
        velocities[idx + 1] += Math.cos(swirlAngle * 0.8) * swirlForce * delta * 6.0;
        velocities[idx + 2] += Math.cos(swirlAngle) * swirlForce * delta * 8.0;
      }

      // Spring physics returning to breathing silhouette
      const springX = (targetX - px) * 3.5;
      const springY = (targetY - py) * 3.5;
      const springZ = (targetZ - pz) * 3.5;

      velocities[idx] += springX * delta;
      velocities[idx + 1] += springY * delta;
      velocities[idx + 2] += springZ * delta;

      // Damping
      velocities[idx] *= 0.90;
      velocities[idx + 1] *= 0.90;
      velocities[idx + 2] *= 0.90;

      px += velocities[idx] * delta;
      py += velocities[idx + 1] * delta;
      pz += velocities[idx + 2] * delta;

      p[idx] = px;
      p[idx + 1] = py;
      p[idx + 2] = pz;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group position={[0.2, 0.45, -7.5]}>
      {/* Soft light emitted onto nearby trees with animated intensity */}
      <pointLight
        ref={lightRef}
        color="#7fffcf"
        intensity={3.5}
        distance={18}
        decay={2}
        position={[0, 1.5, 0]}
      />

      {/* Particle Spirit Deer Point Cloud */}
      <points ref={pointsRef} geometry={geometry}>
        <primitive object={deerMaterial} ref={materialRef} attach="material" />
      </points>
    </group>
  );
}
