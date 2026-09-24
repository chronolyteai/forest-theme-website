'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { getRiverCenter, getRiverWidth } from '@/utils/noise';

/**
 * ReflectiveStream:
 * A shallow, winding mountain river with real-time screen-space reflections
 * powered by Drei's MeshReflectorMaterial.
 *
 * - Geometrically carved to follow procedural river curvature
 * - Animated procedural ripple normal map for realistic dynamic water distortion
 * - Reflects the ancient canopy, volumetric god rays, and the celestial spirit creature
 */
export function ReflectiveStream() {
  const meshRef = useRef<THREE.Mesh>(null);
  const normalMapRef = useRef<THREE.CanvasTexture | null>(null);

  // Generate procedural ribbon geometry for the winding river
  const { geometry, normalCanvas, normalCtx } = useMemo(() => {
    const segmentsZ = 120;
    const segmentsX = 14;
    const startZ = 28;
    const endZ = -50;
    const length = startZ - endZ;

    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let j = 0; j <= segmentsZ; j++) {
      const v = j / segmentsZ;
      const z = startZ - v * length;
      const centerX = getRiverCenter(z);
      const width = getRiverWidth(z) * 1.05;

      for (let i = 0; i <= segmentsX; i++) {
        const u = i / segmentsX;
        const x = centerX + (u - 0.5) * 2 * width;
        // Water surface rests at y = 0.0, with subtle bank tuck
        const y = 0.02 - Math.pow(Math.abs(u - 0.5) * 2, 4) * 0.05;

        positions.push(x, y, z);
        uvs.push(u, v * 8); // Repeat UVs along length for fine ripples
      }
    }

    const rowWidth = segmentsX + 1;
    for (let j = 0; j < segmentsZ; j++) {
      for (let i = 0; i < segmentsX; i++) {
        const a = j * rowWidth + i;
        const b = (j + 1) * rowWidth + i;
        const c = (j + 1) * rowWidth + (i + 1);
        const d = j * rowWidth + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    // Setup offscreen canvas for animated ripple normal map
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;

    if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      ctx = canvas.getContext('2d');
    }

    return { geometry: geom, normalCanvas: canvas, normalCtx: ctx };
  }, []);

  // Initialize CanvasTexture for water ripple normals
  const rippleTexture = useMemo(() => {
    if (!normalCanvas) return null;
    const tex = new THREE.CanvasTexture(normalCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 16);
    normalMapRef.current = tex;
    return tex;
  }, [normalCanvas]);

  // Animate water normal map ripples in useFrame
  useFrame(({ clock }) => {
    if (!normalCtx || !normalCanvas || !normalMapRef.current) return;
    const time = clock.getElapsedTime() * 1.5;

    // Render multi-octave water wave normal map
    const width = 128;
    const height = 128;
    const imgData = normalCtx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        // Wave interference pattern
        const nx = x / width;
        const ny = y / height;
        const w1 = Math.sin(nx * 18 + time) * Math.cos(ny * 14 + time * 0.8);
        const w2 = Math.sin(nx * 32 - time * 1.2 + ny * 20) * 0.5;
        const w3 = Math.cos((nx + ny) * 24 + time * 1.5) * 0.3;
        const h = w1 + w2 + w3;

        // Perturb normals (Tangent space: R=X, G=Y, B=Z)
        const dx = Math.cos(nx * 18 + time) * 25 + Math.cos(nx * 32) * 15;
        const dy = Math.sin(ny * 14 + time) * 25 + Math.sin(ny * 20) * 15;

        data[index] = Math.min(255, Math.max(0, 128 + dx)); // Red (X normal)
        data[index + 1] = Math.min(255, Math.max(0, 128 + dy)); // Green (Y normal)
        data[index + 2] = 240; // Blue (Z pointing up)
        data[index + 3] = 255; // Alpha
      }
    }

    normalCtx.putImageData(imgData, 0, 0);
    normalMapRef.current.needsUpdate = true;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Real-time Reflective Water Surface */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow>
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mirror={0.72}
          mixBlur={0.8}
          mixStrength={2.2}
          roughness={0.18}
          depthScale={1.4}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.6}
          color="#06221c"
          metalness={0.65}
          reflectorOffset={0.02}
          normalMap={rippleTexture || undefined}
          normalScale={new THREE.Vector2(0.35, 0.35)}
        />
      </mesh>

      {/* Subtle glowing riverbed undercurrent */}
      <mesh geometry={geometry} position={[0, -0.05, 0]}>
        <meshBasicMaterial
          color="#0a3f35"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
