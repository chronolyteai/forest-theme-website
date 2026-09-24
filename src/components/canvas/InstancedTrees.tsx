'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getRiverCenter, getRiverWidth, getTerrainHeight } from '@/utils/noise';

export interface TreeInstanceData {
  x: number;
  y: number;
  z: number;
  scaleY: number;
  scaleXZ: number;
  rotY: number;
  rotTilt: number;
  instanceOffset: number;
}

// Exported for camera collision detection (collision radius 1.5)
export const activeTreePositions: Array<{ x: number; z: number; radius: number }> = [];

/**
 * InstancedTrees:
 * 320+ ancient redwood and cedar trees distributed across the valley.
 * - Trunks: procedural dark bark normal map, moss patches via vertex color blend
 * - Foliage: custom vertex shader with exact wind sway formula:
 *     pos.x += sin(time * 0.5 + pos.y * 0.3 + instanceOffset) * 0.05 * height
 * - Backlit rim lighting (Fresnel term, warm amber #ffb347)
 * - Distant trees fade into pure silhouettes #0a1f1a
 * - Dense overhead canopy layer occluding the sky
 */
export function InstancedTrees() {
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null);
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null);
  const overheadCanopyRef = useRef<THREE.InstancedMesh>(null);
  const foliageMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate 320 tree positions
  const treeData = useMemo(() => {
    const list: TreeInstanceData[] = [];
    activeTreePositions.length = 0;

    const minZ = -55;
    const maxZ = 28;
    const countZ = 40;
    const stepZ = (maxZ - minZ) / countZ;

    for (let i = 0; i < countZ; i++) {
      const z = maxZ - i * stepZ;
      const rX = getRiverCenter(z);
      const rW = getRiverWidth(z) + 1.6;

      // Left bank (4 rows of depth)
      for (let col = 0; col < 4; col++) {
        const x = rX - rW - 1.2 - col * 3.6 - Math.random() * 2.2;
        const y = getTerrainHeight(x, z);
        const scaleY = 16 + Math.random() * 16;
        const scaleXZ = 0.85 + Math.random() * 0.55;
        const rotY = Math.random() * Math.PI * 2;
        const rotTilt = (Math.random() - 0.5) * 0.06;
        const offset = Math.random() * 20.0;

        list.push({ x, y, z: z + (Math.random() - 0.5) * 2.0, scaleY, scaleXZ, rotY, rotTilt, instanceOffset: offset });
        activeTreePositions.push({ x, z, radius: 1.5 });
      }

      // Right bank (4 rows of depth)
      for (let col = 0; col < 4; col++) {
        const x = rX + rW + 1.2 + col * 3.6 + Math.random() * 2.2;
        const y = getTerrainHeight(x, z);
        const scaleY = 16 + Math.random() * 16;
        const scaleXZ = 0.85 + Math.random() * 0.55;
        const rotY = Math.random() * Math.PI * 2;
        const rotTilt = (Math.random() - 0.5) * 0.06;
        const offset = Math.random() * 20.0;

        list.push({ x, y, z: z + (Math.random() - 0.5) * 2.0, scaleY, scaleXZ, rotY, rotTilt, instanceOffset: offset });
        activeTreePositions.push({ x, z, radius: 1.5 });
      }
    }

    // Distant background ridge trees (silhouettes in fog)
    for (let bg = 0; bg < 40; bg++) {
      const z = -40 - Math.random() * 22;
      const x = (Math.random() - 0.5) * 55;
      const y = getTerrainHeight(x, z) + 1.5;
      const scaleY = 22 + Math.random() * 12;
      const scaleXZ = 1.1 + Math.random() * 0.5;
      const offset = Math.random() * 20.0;

      list.push({ x, y, z, scaleY, scaleXZ, rotY: Math.random() * Math.PI * 2, rotTilt: 0, instanceOffset: offset });
      activeTreePositions.push({ x, z, radius: 1.5 });
    }

    return list;
  }, []);

  const treeCount = treeData.length; // 360 trees

  // Procedural Bark Normal Map generated on 256x256 Canvas
  const barkNormalMap = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = ctx.createImageData(256, 256);
    const d = img.data;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const idx = (y * 256 + x) * 4;
        // Vertical bark grooves
        const nx = x / 256;
        const ny = y / 256;
        const groove = Math.sin(nx * 60.0 + Math.sin(ny * 20.0) * 2.0);
        const fine = Math.sin(nx * 140.0) * 0.4;
        const val = groove + fine;

        const dx = Math.cos(nx * 60.0) * 45;
        const dy = Math.sin(ny * 20.0) * 15;

        d[idx] = Math.min(255, Math.max(0, 128 + dx));     // Normal X
        d[idx + 1] = Math.min(255, Math.max(0, 128 + dy)); // Normal Y
        d[idx + 2] = 240;                                  // Normal Z (pointing out)
        d[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 8);
    return tex;
  }, []);

  // Trunk Geometry: Tapering redwood trunk with vertex colors for moss blend
  const trunkGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.42, 0.95, 1, 10, 8);
    geom.translate(0, 0.5, 0); // Origin at base
    const pos = geom.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    const mossCol = new THREE.Color('#2d5a4a');  // Moss accent
    const barkCol = new THREE.Color('#0a1f1a');  // Deep shadow bark

    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      // Moss concentrated on lower 35% of trunk
      const mossFactor = Math.max(0.0, 1.0 - y * 2.8);
      const c = new THREE.Color().lerpColors(barkCol, mossCol, mossFactor);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Trunk Material
  const trunkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.92,
      metalness: 0.08,
      vertexColors: true,
      normalMap: barkNormalMap || undefined,
      normalScale: new THREE.Vector2(0.8, 0.8),
    });
  }, [barkNormalMap]);

  // Foliage Geometry (icosahedron clusters)
  const foliageGeometry = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(2.0, 2);
    // Add instanceOffset attribute buffer for wind sway
    const instanceOffsets = new Float32Array(treeCount * 3);
    for (let i = 0; i < treeCount * 3; i++) {
      instanceOffsets[i] = Math.random() * 25.0;
    }
    geom.setAttribute('aInstanceOffset', new THREE.InstancedBufferAttribute(instanceOffsets, 1));
    return geom;
  }, [treeCount]);

  // Overhead Sky-Occluding Canopy Geometry
  const overheadCanopyGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(3.6, 2);
  }, []);

  // Custom Foliage Material with wind sway and warm amber backlit rim lighting
  const foliageMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeepShadow: { value: new THREE.Color('#0a1f1a') },
        uMidForest: { value: new THREE.Color('#1a3d2e') },
        uMossAccent: { value: new THREE.Color('#2d5a4a') },
        uWarmAmberRim: { value: new THREE.Color('#ffb347') },
        uSunRayGold: { value: new THREE.Color('#c9a961') },
        uSunDir: { value: new THREE.Vector3(14, 22, -42).normalize() },
      },
      vertexShader: /* glsl */ `
        attribute float aInstanceOffset;

        uniform float uTime;
        uniform vec3 uSunDir;

        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewDir;
        varying float vDistance;

        void main() {
          vNormal = normalize(normalMatrix * normal);

          vec4 worldPos = instanceMatrix * vec4(position, 1.0);

          // EXACT MANDATED WIND SWAY FORMULA:
          // pos.x += sin(time * 0.5 + pos.y * 0.3 + instanceOffset) * 0.05 * height
          float height = max(0.2, worldPos.y);
          float swayX = sin(uTime * 0.5 + worldPos.y * 0.3 + aInstanceOffset) * 0.05 * height;
          float swayZ = cos(uTime * 0.4 + worldPos.y * 0.25 + aInstanceOffset) * 0.035 * height;

          worldPos.x += swayX;
          worldPos.z += swayZ;

          vWorldPos = worldPos.xyz;
          vec4 mvPos = viewMatrix * worldPos;
          vViewDir = normalize(-mvPos.xyz);
          vDistance = length(mvPos.xyz);

          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uDeepShadow;
        uniform vec3 uMidForest;
        uniform vec3 uMossAccent;
        uniform vec3 uWarmAmberRim;
        uniform vec3 uSunRayGold;
        uniform vec3 uSunDir;

        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewDir;
        varying float vDistance;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewDir);
          vec3 L = normalize(uSunDir);

          // Direct light diffuse
          float NdotL = max(0.0, dot(N, L));

          // MANDATED BACKLIT RIM LIGHTING (Fresnel term, warm amber #ffb347)
          float fresnel = 1.0 - max(0.0, dot(N, V));
          float rim = pow(fresnel, 2.8);

          // Base foliage color gradient
          vec3 col = mix(uDeepShadow, uMidForest, NdotL * 0.7 + 0.3);
          col = mix(col, uMossAccent, pow(NdotL, 1.8) * 0.5);

          // Additive warm amber backlit rim glow through the leaves
          col += uWarmAmberRim * rim * 1.1;
          col += uSunRayGold * pow(NdotL, 3.0) * 0.4;

          // DISTANT FOGGED SILHOUETTES in the distance (pure #0a1f1a)
          float silhouetteFactor = smoothstep(32.0, 68.0, vDistance);
          col = mix(col, uDeepShadow, silhouetteFactor * 0.92);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, []);

  // Populate instance matrices on mount
  useEffect(() => {
    if (!trunkMeshRef.current || !foliageMeshRef.current || !overheadCanopyRef.current) return;

    const dummy = new THREE.Object3D();
    const foliageDummy = new THREE.Object3D();
    const canopyDummy = new THREE.Object3D();

    let fIdx = 0;
    let cIdx = 0;

    treeData.forEach((t, i) => {
      // 1. Trunk transform
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(t.rotTilt, t.rotY, t.rotTilt * 0.5);
      dummy.scale.set(t.scaleXZ, t.scaleY, t.scaleXZ);
      dummy.updateMatrix();
      trunkMeshRef.current!.setMatrixAt(i, dummy.matrix);

      // 2. Foliage clusters (3 tiers per tree)
      const tiers = [0.65, 0.85, 1.02];
      tiers.forEach((ratio, tierIdx) => {
        const h = t.y + t.scaleY * ratio;
        const s = (1.15 - tierIdx * 0.22) * (t.scaleXZ * 1.9);

        foliageDummy.position.set(
          t.x + Math.sin(tierIdx * 2.2) * 0.35,
          h,
          t.z + Math.cos(tierIdx * 2.2) * 0.35
        );
        foliageDummy.rotation.set(0.12 * tierIdx, t.rotY + tierIdx * 1.3, 0);
        foliageDummy.scale.set(s, s * 0.92, s);
        foliageDummy.updateMatrix();

        if (fIdx < treeCount * 3) {
          foliageMeshRef.current!.setMatrixAt(fIdx, foliageDummy.matrix);
          fIdx++;
        }
      });

      // 3. Dense overhead sky-occluding canopy layer on tall trees
      if (t.scaleY > 20 && cIdx < 120) {
        canopyDummy.position.set(t.x, t.y + t.scaleY * 1.05, t.z);
        canopyDummy.rotation.set(0.2, t.rotY, 0.1);
        canopyDummy.scale.set(t.scaleXZ * 2.6, t.scaleXZ * 1.8, t.scaleXZ * 2.6);
        canopyDummy.updateMatrix();
        overheadCanopyRef.current!.setMatrixAt(cIdx, canopyDummy.matrix);
        cIdx++;
      }
    });

    trunkMeshRef.current.instanceMatrix.needsUpdate = true;
    foliageMeshRef.current.instanceMatrix.needsUpdate = true;
    overheadCanopyRef.current.instanceMatrix.needsUpdate = true;
  }, [treeData, treeCount]);

  useFrame(({ clock }) => {
    if (foliageMaterialRef.current) {
      foliageMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* 320 Instanced Trunks */}
      <instancedMesh
        ref={trunkMeshRef}
        args={[trunkGeometry, trunkMaterial, treeCount]}
        castShadow
        receiveShadow
      />

      {/* 960 Instanced Foliage Clusters with Wind Sway Shader */}
      <instancedMesh
        ref={foliageMeshRef}
        args={[foliageGeometry, foliageMaterial, treeCount * 3]}
        castShadow
        receiveShadow
      >
        <primitive object={foliageMaterial} ref={foliageMaterialRef} attach="material" />
      </instancedMesh>

      {/* Dense Overhead Leaf Layer that Occludes the Sky */}
      <instancedMesh
        ref={overheadCanopyRef}
        args={[overheadCanopyGeometry, foliageMaterial, 120]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
