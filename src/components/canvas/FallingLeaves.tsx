'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * FallingLeaves:
 * Physics-lite falling leaves drifting down from the canopy.
 * Features:
 * - Instanced mesh with 320 stylized leaves
 * - Rotational tumbling (pitch, roll, yaw oscillating with independent frequencies)
 * - Wind drift along X & Z axes
 * - Seamless loop: leaves that hit ground level reset back into the upper canopy
 */
export function FallingLeaves() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const leafCount = 320;

  // Individual leaf state data
  const leaves = useMemo(() => {
    const list: Array<{
      x: number;
      y: number;
      z: number;
      speedY: number;
      driftSpeedX: number;
      driftSpeedZ: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      scale: number;
      phase: number;
    }> = [];

    for (let i = 0; i < leafCount; i++) {
      list.push({
        x: (Math.random() - 0.5) * 36,
        y: 1.0 + Math.random() * 16,
        z: -42 + Math.random() * 65,
        speedY: 0.35 + Math.random() * 0.45,
        driftSpeedX: 0.2 + Math.random() * 0.3,
        driftSpeedZ: (Math.random() - 0.5) * 0.2,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedX: 0.8 + Math.random() * 1.6,
        rotSpeedY: 1.2 + Math.random() * 2.0,
        rotSpeedZ: 0.6 + Math.random() * 1.4,
        scale: 0.18 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return list;
  }, []);

  // Geometry: stylized leaf diamond with a center fold
  const leafGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    // 4 vertices forming a curved diamond leaf
    const vertices = new Float32Array([
      0, 0.5, 0,       // Top tip
      -0.22, 0, 0.05,  // Left fold
      0.22, 0, 0.05,   // Right fold
      0, -0.4, 0,      // Stem tip
    ]);

    const indices = [
      0, 1, 2, // Top half
      1, 3, 2, // Bottom half
    ];

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Set randomized autumnal / forest colors per leaf instance
  const leafMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.65,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  }, []);

  React.useEffect(() => {
    if (!meshRef.current) return;
    const colors = [
      new THREE.Color('#f59e0b'), // Amber
      new THREE.Color('#d97706'), // Deep Amber
      new THREE.Color('#fbbf24'), // Warm Gold
      new THREE.Color('#34d399'), // Fresh Spore
      new THREE.Color('#10b981'), // Emerald
      new THREE.Color('#b45309'), // Rust
    ];

    for (let i = 0; i < leafCount; i++) {
      const col = colors[i % colors.length];
      meshRef.current.setColorAt(i, col);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [leafCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    leaves.forEach((l, i) => {
      // Fall down
      l.y -= l.speedY * delta;

      // Wind fluttering sideways
      const flutterX = Math.sin(time * 2.2 + l.phase) * 0.45;
      const flutterZ = Math.cos(time * 1.8 + l.phase) * 0.3;

      l.x += (l.driftSpeedX + flutterX) * delta;
      l.z += (l.driftSpeedZ + flutterZ) * delta;

      // Tumbling rotations
      l.rotX += l.rotSpeedX * delta;
      l.rotY += l.rotSpeedY * delta;
      l.rotZ += l.rotSpeedZ * delta;

      // Loop back up to canopy when hitting ground (y < 0.2)
      if (l.y < 0.2) {
        l.y = 15.0 + Math.random() * 4.0;
        l.x = (Math.random() - 0.5) * 36;
        l.z = -42 + Math.random() * 65;
      }

      dummy.position.set(l.x, l.y, l.z);
      dummy.rotation.set(l.rotX, l.rotY, l.rotZ);
      dummy.scale.set(l.scale, l.scale, l.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[leafGeometry, leafMaterial, leafCount]}
      castShadow
    />
  );
}
