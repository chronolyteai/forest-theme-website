'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getRiverCenter, getRiverWidth, getTerrainHeight } from '@/utils/noise';

/**
 * ForestTerrain:
 * Procedural ancient forest floor with undulating mossy hills,
 * carved riverbed, river stones, and fallen moss-covered ancient logs.
 */
export function ForestTerrain() {
  // Generate ground mesh deformed by procedural terrain height
  const { terrainGeometry, rocks, logs, ferns } = useMemo(() => {
    const width = 64;
    const depth = 90;
    const segmentsX = 80;
    const segmentsZ = 100;

    const geom = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
    geom.rotateX(-Math.PI / 2);
    // Center around z = -10 so it extends from z = 35 to z = -55
    geom.translate(0, 0, -10);

    const pos = geom.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    const mossColor = new THREE.Color('#1b422a');
    const deepSoilColor = new THREE.Color('#08160f');
    const riverBedColor = new THREE.Color('#05120c');
    const goldMossColor = new THREE.Color('#2d5e38');

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = getTerrainHeight(x, z);
      pos.setY(i, h);

      // Color computation based on proximity to river & elevation
      const riverX = getRiverCenter(z);
      const distToRiver = Math.abs(x - riverX);
      const riverW = getRiverWidth(z);

      const vertexColor = new THREE.Color();
      if (distToRiver < riverW) {
        // Deep riverbed
        vertexColor.copy(riverBedColor);
      } else if (distToRiver < riverW + 2.5) {
        // Wet muddy river bank
        const t = (distToRiver - riverW) / 2.5;
        vertexColor.lerpColors(riverBedColor, deepSoilColor, t);
      } else {
        // Forest floor with lush moss
        const mossNoise = Math.sin(x * 0.4) * Math.cos(z * 0.4);
        const t = (h + 0.5) / 2.5;
        vertexColor.lerpColors(mossColor, goldMossColor, Math.max(0, Math.min(1, t + mossNoise * 0.2)));
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    // Procedural river boulders & rocks
    const rockList: Array<{ position: [number, number, number]; scale: [number, number, number]; rotation: [number, number, number] }> = [];
    for (let z = 25; z > -45; z -= 1.8) {
      const rX = getRiverCenter(z);
      const rW = getRiverWidth(z);
      // Place stones on both sides of river bank
      const offsets = [-(rW + 0.3 + Math.random() * 1.5), (rW + 0.3 + Math.random() * 1.5)];
      offsets.forEach((off) => {
        if (Math.random() > 0.4) {
          const x = rX + off;
          const y = getTerrainHeight(x, z) + 0.1;
          const s = 0.35 + Math.random() * 0.7;
          rockList.push({
            position: [x, y, z],
            scale: [s * (0.8 + Math.random() * 0.4), s * (0.6 + Math.random() * 0.5), s * (0.8 + Math.random() * 0.4)],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          });
        }
      });
    }

    // Ancient fallen mossy logs
    const logList: Array<{ position: [number, number, number]; scale: [number, number, number]; rotation: [number, number, number] }> = [];
    const logLocations = [
      { x: -5, z: 12, rotY: 0.6, length: 7 },
      { x: 6, z: 2, rotY: -0.4, length: 8 },
      { x: -7, z: -14, rotY: 1.1, length: 9 },
      { x: 5, z: -28, rotY: -0.8, length: 8 },
    ];
    logLocations.forEach((loc) => {
      const y = getTerrainHeight(loc.x, loc.z) + 0.35;
      logList.push({
        position: [loc.x, y, loc.z],
        scale: [0.55, loc.length, 0.55],
        rotation: [Math.PI / 2 + (Math.random() - 0.5) * 0.1, loc.rotY, (Math.random() - 0.5) * 0.1],
      });
    });

    // Fern clusters along the banks
    const fernList: Array<{ position: [number, number, number]; rotation: number; scale: number }> = [];
    for (let z = 24; z > -45; z -= 1.5) {
      const rX = getRiverCenter(z);
      const rW = getRiverWidth(z);
      const sides = [rX - rW - 1.2 - Math.random() * 3, rX + rW + 1.2 + Math.random() * 3];
      sides.forEach((x) => {
        if (Math.random() > 0.3) {
          const y = getTerrainHeight(x, z);
          fernList.push({
            position: [x, y + 0.1, z],
            rotation: Math.random() * Math.PI * 2,
            scale: 0.6 + Math.random() * 0.7,
          });
        }
      });
    }

    return { terrainGeometry: geom, rocks: rockList, logs: logList, ferns: fernList };
  }, []);

  // Geometry for rocks (dodecahedron for natural faceted stone shape)
  const rockGeometry = useMemo(() => new THREE.DodecahedronGeometry(1, 1), []);
  const rockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a2822',
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true,
      }),
    []
  );

  // Geometry for ancient logs
  const logGeometry = useMemo(() => new THREE.CylinderGeometry(0.7, 0.9, 1, 8), []);
  const logMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#181f18',
        roughness: 0.95,
        metalness: 0.05,
      }),
    []
  );

  return (
    <group>
      {/* Main undulating forest floor */}
      <mesh geometry={terrainGeometry} receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* River bank boulders */}
      {rocks.map((r, i) => (
        <mesh
          key={`rock-${i}`}
          geometry={rockGeometry}
          material={rockMaterial}
          position={r.position}
          scale={r.scale}
          rotation={r.rotation}
          castShadow
          receiveShadow
        />
      ))}

      {/* Ancient mossy fallen logs */}
      {logs.map((l, i) => (
        <mesh
          key={`log-${i}`}
          geometry={logGeometry}
          material={logMaterial}
          position={l.position}
          scale={l.scale}
          rotation={l.rotation}
          castShadow
          receiveShadow
        />
      ))}

      {/* Stylized forest ferns */}
      {ferns.map((f, i) => (
        <group key={`fern-${i}`} position={f.position} rotation={[0, f.rotation, 0]} scale={f.scale}>
          {[0, 1, 2, 3, 4].map((leafIdx) => {
            const angle = (leafIdx / 5) * Math.PI * 2;
            return (
              <mesh
                key={leafIdx}
                rotation={[0.5, angle, 0]}
                position={[Math.sin(angle) * 0.3, 0.15, Math.cos(angle) * 0.3]}
              >
                <planeGeometry args={[0.35, 1.1]} />
                <meshStandardMaterial
                  color="#1e5838"
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
