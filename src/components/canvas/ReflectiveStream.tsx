'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { getRiverCenter, getRiverWidth } from '@/utils/noise';
import { glslNoise3D } from '@/utils/noise';

/**
 * ReflectiveStream:
 * - MeshReflectorMaterial with roughness 0.05, resolution 1024, distortion via normal map scroll
 * - Soft alpha-blended shoreline foam shader along water edges
 * - Subtle animated caustics projected onto the stream bed
 */
export function ReflectiveStream() {
  const meshRef = useRef<THREE.Mesh>(null);
  const normalMapRef = useRef<THREE.CanvasTexture | null>(null);
  const foamMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const causticsMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate stream ribbon, shoreline foam geometry, and riverbed caustics plane
  const { streamGeometry, leftFoamGeom, rightFoamGeom, bedGeometry, normalCanvas, normalCtx } = useMemo(() => {
    const segmentsZ = 130;
    const segmentsX = 14;
    const startZ = 28;
    const endZ = -52;
    const length = startZ - endZ;

    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Left and right shoreline foam ribbons
    const leftFoamPos: number[] = [];
    const rightFoamPos: number[] = [];
    const foamUvs: number[] = [];
    const foamIndices: number[] = [];

    for (let j = 0; j <= segmentsZ; j++) {
      const v = j / segmentsZ;
      const z = startZ - v * length;
      const cX = getRiverCenter(z);
      const w = getRiverWidth(z) * 1.05;

      for (let i = 0; i <= segmentsX; i++) {
        const u = i / segmentsX;
        const x = cX + (u - 0.5) * 2 * w;
        const y = 0.02 - Math.pow(Math.abs(u - 0.5) * 2, 4) * 0.04;
        positions.push(x, y, z);
        uvs.push(u, v * 12);
      }

      // Shoreline foam points (width 0.45)
      // Left bank
      const leftOuterX = cX - w - 0.25;
      const leftInnerX = cX - w + 0.35;
      leftFoamPos.push(leftOuterX, 0.06, z, leftInnerX, 0.02, z);

      // Right bank
      const rightInnerX = cX + w - 0.35;
      const rightOuterX = cX + w + 0.25;
      rightFoamPos.push(rightInnerX, 0.02, z, rightOuterX, 0.06, z);

      foamUvs.push(0, v * 24, 1, v * 24);
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

      // Foam ribbon indices
      const fa = j * 2;
      const fb = (j + 1) * 2;
      foamIndices.push(fa, fb, fa + 1);
      foamIndices.push(fb, fb + 1, fa + 1);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    // Build left foam ribbon
    const lFoam = new THREE.BufferGeometry();
    lFoam.setAttribute('position', new THREE.Float32BufferAttribute(leftFoamPos, 3));
    lFoam.setAttribute('uv', new THREE.Float32BufferAttribute(foamUvs, 2));
    lFoam.setIndex(foamIndices);

    // Build right foam ribbon
    const rFoam = new THREE.BufferGeometry();
    rFoam.setAttribute('position', new THREE.Float32BufferAttribute(rightFoamPos, 3));
    rFoam.setAttribute('uv', new THREE.Float32BufferAttribute(foamUvs, 2));
    rFoam.setIndex(foamIndices);

    // Offscreen canvas for scrolling ripple normals
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      ctx = canvas.getContext('2d');
    }

    return {
      streamGeometry: geom,
      leftFoamGeom: lFoam,
      rightFoamGeom: rFoam,
      bedGeometry: geom.clone(),
      normalCanvas: canvas,
      normalCtx: ctx,
    };
  }, []);

  // Scrolling Ripple Texture
  const rippleTexture = useMemo(() => {
    if (!normalCanvas) return null;
    const tex = new THREE.CanvasTexture(normalCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 18);
    normalMapRef.current = tex;
    return tex;
  }, [normalCanvas]);

  // Soft Alpha-Blended Foam Shader Material
  const foamMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uFoamColor: { value: new THREE.Color('#e8dcc4') },
        uWaterColor: { value: new THREE.Color('#0a1f1a') },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uFoamColor;
        uniform vec3 uWaterColor;
        varying vec2 vUv;

        ${glslNoise3D}

        void main() {
          // Foam edge wave
          float edge = vUv.x; // 0.0 outer bank, 1.0 inner stream
          float wave = snoise(vec3(vUv * 8.0, uTime * 0.8));
          float foamMask = smoothstep(0.1, 0.9, edge + wave * 0.35);

          // Soft alpha blend
          float alpha = (1.0 - edge) * smoothstep(0.0, 0.4, edge) * (0.45 + wave * 0.25);
          gl_FragColor = vec4(mix(uWaterColor, uFoamColor, foamMask), alpha * 0.65);
        }
      `,
    });
  }, []);

  // Underwater Caustics Shader Material
  const causticsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCausticGold: { value: new THREE.Color('#c9a961') },
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
        uniform vec3 uCausticGold;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          // Voronoi-like wave caustic interference pattern
          vec2 p = vWorldPos.xz * 1.8;
          float c1 = sin(p.x * 2.5 + uTime * 2.2) * cos(p.y * 2.2 + uTime * 1.8);
          float c2 = sin(p.x * 4.2 - uTime * 1.5 + p.y * 3.0);
          float c3 = cos((p.x + p.y) * 3.5 + uTime * 2.0);
          float caustic = pow(clamp(c1 + c2 + c3, 0.0, 3.0) / 3.0, 3.2);

          gl_FragColor = vec4(uCausticGold * caustic * 0.35, caustic * 0.3);
        }
      `,
    });
  }, []);

  // Animate scrolling normal map and shaders in useFrame
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (foamMaterialRef.current) {
      foamMaterialRef.current.uniforms.uTime.value = time;
    }
    if (causticsMaterialRef.current) {
      causticsMaterialRef.current.uniforms.uTime.value = time;
    }

    if (!normalCtx || !normalCanvas || !normalMapRef.current) return;
    const w = 128;
    const h = 128;
    const imgData = normalCtx.createImageData(w, h);
    const data = imgData.data;

    // Normal map scroll
    const scrollT = time * 1.4;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const nx = x / w;
        const ny = y / h;

        const dx = Math.cos(nx * 20.0 + scrollT) * 26 + Math.cos(nx * 36.0 - scrollT * 1.2) * 16;
        const dy = Math.sin(ny * 16.0 + scrollT * 1.5) * 26 + Math.sin(ny * 28.0) * 16;

        data[idx] = Math.min(255, Math.max(0, 128 + dx));
        data[idx + 1] = Math.min(255, Math.max(0, 128 + dy));
        data[idx + 2] = 245;
        data[idx + 3] = 255;
      }
    }
    normalCtx.putImageData(imgData, 0, 0);
    normalMapRef.current.needsUpdate = true;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Underwater Caustics projected onto stream bed */}
      <mesh geometry={bedGeometry} position={[0, -0.15, 0]}>
        <primitive object={causticsMaterial} ref={causticsMaterialRef} attach="material" />
      </mesh>

      {/* Main Stream Surface: MeshReflectorMaterial with exact mandated props */}
      <mesh ref={meshRef} geometry={streamGeometry} receiveShadow>
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={1024}
          mirror={0.88}
          mixBlur={0.25}
          mixStrength={3.2}
          roughness={0.05}
          depthScale={1.3}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color="#0a1f1a"
          metalness={0.7}
          reflectorOffset={0.02}
          normalMap={rippleTexture || undefined}
          normalScale={new THREE.Vector2(0.35, 0.35)}
        />
      </mesh>

      {/* Soft Alpha-Blended Foam Ribbons along Shorelines */}
      <mesh geometry={leftFoamGeom}>
        <primitive object={foamMaterial} ref={foamMaterialRef} attach="material" />
      </mesh>
      <mesh geometry={rightFoamGeom}>
        <primitive object={foamMaterial} attach="material" />
      </mesh>
    </group>
  );
}
