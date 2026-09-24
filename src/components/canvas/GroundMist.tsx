'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glslNoise3D } from '@/utils/noise';

/**
 * GroundMist:
 * Multi-tiered creeping ground fog with animated procedural noise
 * and subtle aurora-like color shifts over time.
 */
export function GroundMist() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const mistGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(65, 95, 32, 32);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  const mistMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.15 },
        uDensity: { value: 0.28 },
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
        uniform float uDensity;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        ${glslNoise3D}

        void main() {
          // Dual scrolling coordinate frames for swirling mist
          vec3 p1 = vWorldPos * 0.06 + vec3(uTime * 0.03, 0.0, uTime * 0.015);
          vec3 p2 = vWorldPos * 0.12 - vec3(uTime * 0.02, 0.0, -uTime * 0.025);

          float n1 = snoise(p1);
          float n2 = snoise(p2) * 0.5;
          float mistNoise = (n1 + n2) * 0.5 + 0.5;

          // Radial falloff so plane boundary is imperceptible
          vec2 centerDist = vUv - vec2(0.5, 0.5);
          float radialFade = 1.0 - smoothstep(0.2, 0.49, length(centerDist));

          // Aurora-like subtle color shifting over time
          float colorCycle = uTime * 0.08;
          vec3 cTeal = vec3(0.04, 0.18, 0.17);     // Deep river teal
          vec3 cJade = vec3(0.05, 0.25, 0.15);     // Ancient moss jade
          vec3 cViolet = vec3(0.14, 0.10, 0.24);   // Twilight aurora violet
          vec3 cAmber = vec3(0.22, 0.15, 0.06);    // Golden hour warm dusk

          float t1 = (sin(colorCycle) + 1.0) * 0.5;
          float t2 = (cos(colorCycle * 0.7) + 1.0) * 0.5;

          vec3 mistColor = mix(cTeal, cJade, t1);
          mistColor = mix(mistColor, cViolet, t2 * 0.4);
          mistColor = mix(mistColor, cAmber, pow(t1, 3.0) * 0.3);

          float alpha = mistNoise * radialFade * uDensity;

          gl_FragColor = vec4(mistColor * alpha * 2.2, alpha);
        }
      `,
    });
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <group position={[0, 0, -10]}>
      {/* Lower stream mist layer */}
      <mesh geometry={mistGeometry} position={[0, 0.38, 0]}>
        <primitive object={mistMaterial} ref={materialRef} attach="material" />
      </mesh>

      {/* Mid ground fog layer */}
      <mesh
        geometry={mistGeometry}
        position={[0, 0.95, -4]}
        scale={[0.95, 1, 0.95]}
      >
        <primitive object={mistMaterial} attach="material" />
      </mesh>

      {/* Floating canopy mist layer */}
      <mesh
        geometry={mistGeometry}
        position={[0, 1.8, -8]}
        scale={[0.85, 1, 0.85]}
      >
        <primitive object={mistMaterial} attach="material" />
      </mesh>
    </group>
  );
}
