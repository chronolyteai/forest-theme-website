'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getRiverCenter, getRiverWidth, getTerrainHeight } from '@/utils/noise';

/**
 * ForestTerrain:
 * Procedural ancient forest floor with:
 * - 3-octave noise displaced terrain mesh
 * - 48+ instanced mossy boulders
 * - Riverbank fern clusters
 * - Bioluminescent low-poly glowing mushroom clusters (#d4ff7a and #7fffcf)
 */
export function ForestTerrain() {
  const { terrainGeometry, rocks, mushrooms, ferns } = useMemo(() => {
    const width = 72;
    const depth = 100;
    const segmentsX = 90;
    const segmentsZ = 120;

    const geom = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, 0, -12); // Center around z = -12

    const pos = geom.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    const mossAccent = new THREE.Color('#2d5a4a');
    const midForest = new THREE.Color('#1a3d2e');
    const deepShadow = new THREE.Color('#0a1f1a');

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = getTerrainHeight(x, z);
      pos.setY(i, h);

      // Color assignment based on river proximity and elevation
      const riverX = getRiverCenter(z);
      const riverW = getRiverWidth(z);
      const distToRiver = Math.abs(x - riverX);

      const vertexColor = new THREE.Color();
      if (distToRiver < riverW) {
        // Stream bed (deep shadow)
        vertexColor.copy(deepShadow);
      } else if (distToRiver < riverW + 2.5) {
        // Damp bank
        const t = (distToRiver - riverW) / 2.5;
        vertexColor.lerpColors(deepShadow, midForest, t);
      } else {
        // Mossy forest floor
        const t = Math.max(0.0, Math.min(1.0, (h + 0.5) / 2.4));
        vertexColor.lerpColors(midForest, mossAccent, t);
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    // 48+ instanced boulders
    const rockList: Array<{ pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] }> = [];
    for (let z = 24; z > -48; z -= 1.6) {
      const rX = getRiverCenter(z);
      const rW = getRiverWidth(z);
      [-rW - 0.6 - Math.random() * 1.8, rW + 0.6 + Math.random() * 1.8].forEach((off) => {
        if (Math.random() > 0.35) {
          const x = rX + off;
          const y = getTerrainHeight(x, z) + 0.15;
          const s = 0.4 + Math.random() * 0.8;
          rockList.push({
            pos: [x, y, z],
            scale: [s * (0.8 + Math.random() * 0.4), s * (0.6 + Math.random() * 0.4), s * (0.8 + Math.random() * 0.4)],
            rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          });
        }
      });
    }

    // Low-poly glowing mushroom clusters (#d4ff7a and #7fffcf)
    const shroomList: Array<{ pos: [number, number, number]; scale: number; color: string }> = [];
    const shroomColors = ['#d4ff7a', '#7fffcf'];
    for (let z = 20; z > -42; z -= 3.2) {
      const rX = getRiverCenter(z);
      const rW = getRiverWidth(z);
      const sides = [rX - rW - 1.5 - Math.random() * 2.5, rX + rW + 1.5 + Math.random() * 2.5];
      sides.forEach((x) => {
        const y = getTerrainHeight(x, z);
        // Cluster of 2-4 mushrooms
        const clusterCount = 2 + Math.floor(Math.random() * 3);
        const col = shroomColors[Math.floor(Math.random() * shroomColors.length)];
        for (let k = 0; k < clusterCount; k++) {
          shroomList.push({
            pos: [x + (Math.random() - 0.5) * 0.6, y + 0.05, z + (Math.random() - 0.5) * 0.6],
            scale: 0.12 + Math.random() * 0.16,
            color: col,
          });
        }
      });
    }

    // Fern clusters
    const fernList: Array<{ pos: [number, number, number]; rotY: number; scale: number }> = [];
    for (let z = 22; z > -45; z -= 1.8) {
      const rX = getRiverCenter(z);
      const rW = getRiverWidth(z);
      [-rW - 1.2 - Math.random() * 3.0, rW + 1.2 + Math.random() * 3.0].forEach((x) => {
        if (Math.random() > 0.35) {
          const y = getTerrainHeight(x, z);
          fernList.push({
            pos: [x, y + 0.1, z],
            rotY: Math.random() * Math.PI * 2,
            scale: 0.7 + Math.random() * 0.6,
          });
        }
      });
    }

    return { terrainGeometry: geom, rocks: rockList, mushrooms: shroomList, ferns: fernList };
  }, []);

  const rockGeometry = useMemo(() => new THREE.DodecahedronGeometry(1, 1), []);
  const rockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a3d2e',
        roughness: 0.94,
        metalness: 0.06,
        flatShading: true,
      }),
    []
  );

  const shroomCapGeometry = useMemo(() => new THREE.ConeGeometry(0.5, 0.45, 7), []);
  const shroomStemGeometry = useMemo(() => new THREE.CylinderGeometry(0.1, 0.14, 0.7, 6), []);

  return (
    <group>
      {/* 3-Octave Displaced Ground Terrain */}
      <mesh geometry={terrainGeometry} receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* 48+ Instanced Boulders */}
      {rocks.map((r, i) => (
        <mesh
          key={`rock-${i}`}
          geometry={rockGeometry}
          material={rockMaterial}
          position={r.pos}
          scale={r.scale}
          rotation={r.rot}
          castShadow
          receiveShadow
        />
      ))}

      {/* Low-Poly Bioluminescent Mushroom Clusters */}
      {mushrooms.map((m, i) => (
        <group key={`shroom-${i}`} position={m.pos} scale={m.scale}>
          {/* Stem */}
          <mesh geometry={shroomStemGeometry} position={[0, 0.35, 0]}>
            <meshStandardMaterial color="#0a1f1a" roughness={0.8} />
          </mesh>
          {/* Glowing Cap */}
          <mesh geometry={shroomCapGeometry} position={[0, 0.75, 0]}>
            <meshStandardMaterial
              color={m.color}
              emissive={m.color}
              emissiveIntensity={2.4}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}

      {/* Instanced Forest Ferns */}
      {ferns.map((f, i) => (
        <group key={`fern-${i}`} position={f.pos} rotation={[0, f.rotY, 0]} scale={f.scale}>
          {[0, 1, 2, 3, 4].map((lIdx) => {
            const angle = (lIdx / 5) * Math.PI * 2;
            return (
              <mesh
                key={lIdx}
                rotation={[0.55, angle, 0]}
                position={[Math.sin(angle) * 0.35, 0.15, Math.cos(angle) * 0.35]}
              >
                <planeGeometry args={[0.38, 1.2]} />
                <meshStandardMaterial
                  color="#2d5a4a"
                  roughness={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
