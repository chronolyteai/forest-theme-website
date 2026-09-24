'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useForestStore } from '@/store/useForestStore';
import { getRiverCenter, getRiverWidth, getTerrainHeight } from '@/utils/noise';

/**
 * InstancedTrees:
 * High-performance instanced forest with 140+ ancient redwood & oak trees.
 * - Instanced trunks with root flaring and height variation
 * - Multi-tiered foliage clusters with custom inline GLSL wind sway shader
 * - High-frequency leaf flutter and golden-hour rim lighting
 * - Hover interaction: pointer over trees triggers glowing leaf shimmer
 */
export function InstancedTrees() {
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null);
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null);
  const foliageMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const setHoveredTree = useForestStore((s) => s.setHoveredTree);
  const hoveredTree = useForestStore((s) => s.hoveredTree);

  // Generate tree transforms across the landscape
  const treeData = useMemo(() => {
    const trees: Array<{
      x: number;
      y: number;
      z: number;
      scaleY: number;
      scaleXZ: number;
      rotY: number;
      rotTilt: number;
    }> = [];

    // Grid distribution with organic jitter along the 90m deep forest
    const minZ = -52;
    const maxZ = 28;
    const stepZ = 3.6;

    for (let z = maxZ; z >= minZ; z -= stepZ) {
      const riverX = getRiverCenter(z);
      const riverW = getRiverWidth(z) + 1.8; // Safe clearance from water

      // Left bank trees (3 to 4 depth rows)
      for (let col = 0; col < 4; col++) {
        const x = riverX - riverW - 1.5 - col * 3.8 - Math.random() * 2.2;
        const y = getTerrainHeight(x, z);
        const scaleY = 14 + Math.random() * 14;
        const scaleXZ = 0.8 + Math.random() * 0.6;
        trees.push({
          x,
          y,
          z: z + (Math.random() - 0.5) * 2.5,
          scaleY,
          scaleXZ,
          rotY: Math.random() * Math.PI * 2,
          rotTilt: (Math.random() - 0.5) * 0.08,
        });
      }

      // Right bank trees (3 to 4 depth rows)
      for (let col = 0; col < 4; col++) {
        const x = riverX + riverW + 1.5 + col * 3.8 + Math.random() * 2.2;
        const y = getTerrainHeight(x, z);
        const scaleY = 14 + Math.random() * 14;
        const scaleXZ = 0.8 + Math.random() * 0.6;
        trees.push({
          x,
          y,
          z: z + (Math.random() - 0.5) * 2.5,
          scaleY,
          scaleXZ,
          rotY: Math.random() * Math.PI * 2,
          rotTilt: (Math.random() - 0.5) * 0.08,
        });
      }

      // Dense background trees at the far horizon
      if (z < -38) {
        for (let bg = 0; bg < 3; bg++) {
          const x = riverX + (Math.random() - 0.5) * 16;
          const y = getTerrainHeight(x, z);
          trees.push({
            x,
            y,
            z: z - Math.random() * 8,
            scaleY: 18 + Math.random() * 12,
            scaleXZ: 1.1,
            rotY: Math.random() * Math.PI * 2,
            rotTilt: 0,
          });
        }
      }
    }

    return trees;
  }, []);

  const treeCount = treeData.length;

  // Geometry for ancient trunks (tapering cylinder)
  const trunkGeometry = useMemo(() => {
    // Top radius 0.45, bottom radius 0.85, height 1
    const geom = new THREE.CylinderGeometry(0.45, 0.9, 1, 9, 4);
    geom.translate(0, 0.5, 0); // Origin at base of trunk
    return geom;
  }, []);

  // Geometry for foliage clusters (faceted icosahedron for stylized pine/cedar clusters)
  const foliageGeometry = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1.9, 2);
    return geom;
  }, []);

  // Setup initial instance transformation matrices
  useMemo(() => {
    // We will populate these inside useEffect / ref callback or directly in render
  }, []);

  // Custom Foliage Shader Material with wind sway and leaf shimmer
  const foliageMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHoverShimmer: { value: 0 },
        uSunDir: { value: new THREE.Vector3(0.5, 0.7, -0.4).normalize() },
        uDeepColor: { value: new THREE.Color('#072417') },
        uMidColor: { value: new THREE.Color('#145638') },
        uSunColor: { value: new THREE.Color('#46a86e') },
        uGoldRim: { value: new THREE.Color('#fcd34d') },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewPos;

        void main() {
          vNormal = normalize(normalMatrix * normal);

          // Base position from instance matrix
          vec4 worldPos = instanceMatrix * vec4(position, 1.0);

          // Wind sway calculation
          // Trees sway more at top, grounded at base
          float heightFactor = max(0.0, worldPos.y * 0.08);
          float trunkSwayX = sin(uTime * 1.4 + worldPos.z * 0.15) * 0.35 * heightFactor;
          float trunkSwayZ = cos(uTime * 1.1 + worldPos.x * 0.12) * 0.28 * heightFactor;

          // High frequency leaf flutter
          float leafFlutter = sin(uTime * 5.5 + position.x * 3.0 + position.y * 4.0) * 0.06;

          worldPos.x += trunkSwayX + leafFlutter;
          worldPos.z += trunkSwayZ + leafFlutter * 0.7;

          vWorldPos = worldPos.xyz;
          vec4 mvPos = viewMatrix * worldPos;
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uHoverShimmer;
        uniform vec3 uSunDir;
        uniform vec3 uDeepColor;
        uniform vec3 uMidColor;
        uniform vec3 uSunColor;
        uniform vec3 uGoldRim;

        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewPos;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPos);
          vec3 L = normalize(uSunDir);

          // Diffuse lighting
          float NdotL = max(0.0, dot(N, L));
          
          // Ethereal golden hour rim lighting (backlight glow through needle leaves)
          float rim = 1.0 - max(0.0, dot(N, V));
          rim = pow(rim, 3.2);

          // Multi-tone canopy gradient
          vec3 leafColor = mix(uDeepColor, uMidColor, NdotL * 0.8 + 0.2);
          leafColor = mix(leafColor, uSunColor, pow(NdotL, 2.0) * 0.6);
          leafColor += uGoldRim * rim * 0.65;

          // Interactive leaf shimmer when hovered
          if (uHoverShimmer > 0.01) {
            float wave = sin(vWorldPos.y * 2.0 - uTime * 4.0 + vWorldPos.x * 1.5);
            wave = smoothstep(0.4, 0.95, wave);
            vec3 shimmerColor = vec3(0.9, 0.85, 0.45);
            leafColor = mix(leafColor, shimmerColor, wave * uHoverShimmer * 0.7);
          }

          // Depth fog integration
          float depth = length(vViewPos);
          float fogFactor = smoothstep(20.0, 75.0, depth);
          vec3 fogColor = vec3(0.02, 0.08, 0.06);
          leafColor = mix(leafColor, fogColor, fogFactor * 0.8);

          gl_FragColor = vec4(leafColor, 1.0);
        }
      `,
    });
  }, []);

  // Trunk Bark Material
  const trunkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1b140f',
      roughness: 0.95,
      metalness: 0.05,
    });
  }, []);

  // Set instance matrices on mounts
  React.useEffect(() => {
    if (!trunkMeshRef.current || !foliageMeshRef.current) return;

    const dummy = new THREE.Object3D();
    const foliageDummy = new THREE.Object3D();

    let foliageIndex = 0;

    treeData.forEach((t, i) => {
      // 1. Position and scale Trunk
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(t.rotTilt, t.rotY, t.rotTilt * 0.5);
      dummy.scale.set(t.scaleXZ, t.scaleY, t.scaleXZ);
      dummy.updateMatrix();
      trunkMeshRef.current!.setMatrixAt(i, dummy.matrix);

      // 2. Position Foliage tiers (3 tiers per tree)
      const tiers = [0.65, 0.85, 1.02];
      tiers.forEach((ratio, tierIdx) => {
        const tierHeight = t.y + t.scaleY * ratio;
        const tierScale = (1.1 - tierIdx * 0.22) * (t.scaleXZ * 1.8);

        foliageDummy.position.set(
          t.x + (Math.sin(tierIdx * 2.1) * 0.3),
          tierHeight,
          t.z + (Math.cos(tierIdx * 2.1) * 0.3)
        );
        foliageDummy.rotation.set(0.1 * tierIdx, t.rotY + tierIdx * 1.2, 0);
        foliageDummy.scale.set(tierScale, tierScale * 0.9, tierScale);
        foliageDummy.updateMatrix();

        if (foliageIndex < treeCount * 3) {
          foliageMeshRef.current!.setMatrixAt(foliageIndex, foliageDummy.matrix);
          foliageIndex++;
        }
      });
    });

    trunkMeshRef.current.instanceMatrix.needsUpdate = true;
    foliageMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [treeData, treeCount]);

  // Frame update for wind animation and hover shimmer interpolation
  useFrame(({ clock }, delta) => {
    if (!foliageMaterialRef.current) return;
    foliageMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();

    // Smoothly damp hover shimmer
    const targetShimmer = hoveredTree ? 1.0 : 0.0;
    const current = foliageMaterialRef.current.uniforms.uHoverShimmer.value;
    foliageMaterialRef.current.uniforms.uHoverShimmer.value = THREE.MathUtils.damp(
      current,
      targetShimmer,
      4.0,
      delta
    );
  });

  return (
    <group>
      {/* Instanced Trunks */}
      <instancedMesh
        ref={trunkMeshRef}
        args={[trunkGeometry, trunkMaterial, treeCount]}
        castShadow
        receiveShadow
      />

      {/* Instanced Canopy Foliage Clusters */}
      <instancedMesh
        ref={foliageMeshRef}
        args={[foliageGeometry, foliageMaterial, treeCount * 3]}
        castShadow
        receiveShadow
        onPointerOver={() => setHoveredTree(true)}
        onPointerOut={() => setHoveredTree(false)}
      >
        <primitive object={foliageMaterial} ref={foliageMaterialRef} attach="material" />
      </instancedMesh>
    </group>
  );
}
