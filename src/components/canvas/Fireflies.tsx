'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useForestStore } from '@/store/useForestStore';

/**
 * Fireflies:
 * Thousands of bio-luminescent particles filling the forest air.
 * - Reactive to cursor position in 3D space (repulsion + swirl)
 * - Click to trigger energetic particle shockwave burst with chime
 * - Section 3: Fireflies converge into a glowing celestial constellation
 * - Additive blending with radial Gaussian point glow
 */
export function Fireflies() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { viewport } = useThree();
  const mouse = useForestStore((s) => s.mouse);
  const burstEvent = useForestStore((s) => s.burstEvent);
  const scrollProgress = useForestStore((s) => s.scrollProgress);
  const currentSection = useForestStore((s) => s.currentSection);

  // Responsive particle count (desktop 2,400, mobile 900)
  const particleCount = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 900;
    }
    return 2400;
  }, []);

  // Generate constellation target positions (sacred forest deer / tree glyph)
  const constellationPositions = useMemo(() => {
    const targets: THREE.Vector3[] = [];
    const count = 500; // First 500 fireflies form the constellation

    // Shape: Ethereal sacred tree & antlers constellation floating around [1.5, 3.2, -6]
    for (let i = 0; i < count; i++) {
      const t = i / count;
      let x = 0;
      let y = 0;
      let z = -6.5;

      if (i < 80) {
        // Tree trunk / central spine
        const seg = i / 80;
        x = 1.5 + (Math.random() - 0.5) * 0.15;
        y = 1.2 + seg * 2.2;
      } else if (i < 280) {
        // Radiant canopy crown / glowing star branches
        const angle = ((i - 80) / 200) * Math.PI * 4.0;
        const radius = 0.4 + ((i - 80) / 200) * 1.6;
        x = 1.5 + Math.cos(angle) * radius;
        y = 3.4 + Math.sin(angle) * (radius * 0.7);
        z = -6.5 + (Math.random() - 0.5) * 0.4;
      } else {
        // Orbiting celestial halo ring
        const angle = ((i - 280) / 220) * Math.PI * 2.0;
        x = 1.5 + Math.cos(angle) * 2.1;
        y = 3.4 + Math.sin(angle) * 2.1;
        z = -6.5 + Math.sin(angle * 2.0) * 0.5;
      }

      targets.push(new THREE.Vector3(x, y, z));
    }

    return targets;
  }, []);

  // Initialize particle attributes and buffers
  const { geometry, originalPositions, velocities } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const origPositions = new Float32Array(particleCount * 3);
    const vels = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    const cGold = new THREE.Color('#fcd34d');
    const cAmber = new THREE.Color('#f59e0b');
    const cEmerald = new THREE.Color('#6ee7b7');
    const cSpore = new THREE.Color('#a7f3d0');

    for (let i = 0; i < particleCount; i++) {
      // Forest corridor volume: X [-20, 20], Y [0.4, 12], Z [-48, 24]
      const x = (Math.random() - 0.5) * 38;
      const y = 0.5 + Math.random() * 11;
      const z = -45 + Math.random() * 70;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      origPositions[i * 3] = x;
      origPositions[i * 3 + 1] = y;
      origPositions[i * 3 + 2] = z;

      vels[i * 3] = 0;
      vels[i * 3 + 1] = 0;
      vels[i * 3 + 2] = 0;

      // Color variation: 55% gold/amber, 45% bio-emerald
      const col = new THREE.Color();
      const r = Math.random();
      if (r < 0.35) col.copy(cGold);
      else if (r < 0.6) col.copy(cAmber);
      else if (r < 0.85) col.copy(cEmerald);
      else col.copy(cSpore);

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      // Particle size
      sizes[i] = 14 + Math.random() * 26;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    return {
      geometry: geom,
      originalPositions: origPositions,
      velocities: vels,
    };
  }, [particleCount]);

  // Custom Shader Material for glow points
  const fireflyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;

        attribute float size;
        attribute float phase;
        attribute vec3 color;

        varying vec3 vColor;
        varying float vPhase;

        void main() {
          vColor = color;
          vPhase = phase;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Pulsing glow size
          float pulse = 0.8 + 0.35 * sin(uTime * 2.2 + phase);
          gl_PointSize = size * pulse * uPixelRatio * (18.0 / -mvPosition.z);
          // Clamp size
          gl_PointSize = clamp(gl_PointSize, 4.0, 64.0);

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vColor;
        varying float vPhase;

        void main() {
          // Circular Gaussian falloff
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;

          // Inner hot core + soft outer glowing halo
          float core = smoothstep(0.2, 0.0, dist);
          float halo = exp(-dist * 6.5);
          float intensity = (core * 0.9 + halo * 1.1);

          // Subtle organic twinkle
          float twinkle = 0.85 + 0.3 * sin(uTime * 4.0 + vPhase);

          vec3 finalColor = vColor * intensity * twinkle * 1.8;
          // Add white core
          finalColor += vec3(0.4, 0.4, 0.3) * core;

          gl_FragColor = vec4(finalColor, halo * twinkle);
        }
      `,
    });
  }, []);

  // Physics & Animation Loop
  const lastBurstIdRef = useRef<number | null>(null);

  useFrame(({ clock, camera }, delta) => {
    if (!materialRef.current || !pointsRef.current) return;
    const time = clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = time;

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    // Constellation interpolation factor in Section 2 (WORK/FEATURES)
    const isConstellationActive = scrollProgress >= 0.42 && scrollProgress <= 0.74;
    const constellationFactor = isConstellationActive
      ? Math.sin(((scrollProgress - 0.42) / (0.74 - 0.42)) * Math.PI)
      : 0;

    // Check if a new burst event was triggered
    const isNewBurst = burstEvent && burstEvent.id !== lastBurstIdRef.current;
    if (isNewBurst) {
      lastBurstIdRef.current = burstEvent.id;
      const bX = burstEvent.x;
      const bY = burstEvent.y;
      const bZ = burstEvent.z;

      // Apply explosive radial velocity to nearby fireflies
      for (let i = 0; i < particleCount; i++) {
        const px = positions[i * 3];
        const py = positions[i * 3 + 1];
        const pz = positions[i * 3 + 2];

        const dx = px - bX;
        const dy = py - bY;
        const dz = pz - bZ;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 100) {
          // Inside 10m blast radius
          const dist = Math.sqrt(distSq) + 0.1;
          const force = (1.0 - dist / 10.0) * 16.0;
          velocities[i * 3] += (dx / dist) * force;
          velocities[i * 3 + 1] += (dy / dist) * force + 2.0;
          velocities[i * 3 + 2] += (dz / dist) * force;
        }
      }
    }

    // Mouse influence position in 3D near the camera focal plane
    const mouseWorldX = camera.position.x + mouse.x * 6.0;
    const mouseWorldY = camera.position.y - mouse.y * 4.0;
    const mouseWorldZ = camera.position.z - 8.0;

    // Update each particle
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      let px = positions[idx];
      let py = positions[idx + 1];
      let pz = positions[idx + 2];

      const origX = originalPositions[idx];
      const origY = originalPositions[idx + 1];
      const origZ = originalPositions[idx + 2];

      // Constellation behavior for first 500 fireflies
      if (i < constellationPositions.length && constellationFactor > 0.05) {
        const target = constellationPositions[i];
        const t = constellationFactor * 0.9;
        px = THREE.MathUtils.lerp(px, target.x, t * 0.08);
        py = THREE.MathUtils.lerp(py, target.y, t * 0.08);
        pz = THREE.MathUtils.lerp(pz, target.z, t * 0.08);

        // Constellation subtle vibration
        px += Math.sin(time * 3.0 + i) * 0.01;
        py += Math.cos(time * 2.8 + i) * 0.01;
      } else {
        // Natural gentle organic floating (Perlin-like harmonic sines)
        const wanderX = Math.sin(time * 0.6 + origY * 0.8) * 0.015;
        const wanderY = Math.cos(time * 0.8 + origX * 0.6) * 0.012;
        const wanderZ = Math.sin(time * 0.5 + origZ * 0.4) * 0.015;

        // Mouse gentle repulsion / swirl
        const mdx = px - mouseWorldX;
        const mdy = py - mouseWorldY;
        const mdz = pz - mouseWorldZ;
        const mDistSq = mdx * mdx + mdy * mdy + mdz * mdz;

        if (mDistSq < 25) {
          const mDist = Math.sqrt(mDistSq) + 0.1;
          const repel = (1.0 - mDist / 5.0) * 0.04;
          // Swirl vector
          px += (mdx / mDist) * repel - (mdz / mDist) * repel * 0.5;
          py += (mdy / mDist) * repel * 0.8;
          pz += (mdz / mDist) * repel + (mdx / mDist) * repel * 0.5;
        }

        // Apply velocity from bursts with friction
        px += velocities[idx] * delta;
        py += velocities[idx + 1] * delta;
        pz += velocities[idx + 2] * delta;

        velocities[idx] *= 0.92;
        velocities[idx + 1] *= 0.92;
        velocities[idx + 2] *= 0.92;

        // Drift
        px += wanderX;
        py += wanderY;
        pz += wanderZ;

        // Gentle spring returning to base position
        px += (origX - px) * 0.015;
        py += (origY - py) * 0.015;
        pz += (origZ - pz) * 0.015;
      }

      positions[idx] = px;
      positions[idx + 1] = py;
      positions[idx + 2] = pz;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <primitive object={fireflyMaterial} ref={materialRef} attach="material" />
    </points>
  );
}
