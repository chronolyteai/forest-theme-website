'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glslNoise3D } from '@/utils/noise';

/**
 * VolumetricFog:
 * Raymarched 3D volumetric fog volume.
 * Features:
 * - 24-step raymarching through 3D space
 * - Density driven by 3D Simplex noise (animated on Y + time)
 * - Color blend: #0a1f1a (deep shadow) -> #2d5a4a (mid) -> #c9a961 (near light)
 * - Forward Mie phase function scattering towards the sun position
 */
export function VolumetricFog() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const fogMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uSunPos: { value: new THREE.Vector3(14, 22, -42) },
        uShadowColor: { value: new THREE.Color('#0a1f1a') },
        uMidColor: { value: new THREE.Color('#2d5a4a') },
        uLightColor: { value: new THREE.Color('#c9a961') },
        uFogWarm: { value: new THREE.Color('#e8dcc4') },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorldPos;

        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uSunPos;
        uniform vec3 uShadowColor;
        uniform vec3 uMidColor;
        uniform vec3 uLightColor;
        uniform vec3 uFogWarm;

        varying vec3 vWorldPos;

        ${glslNoise3D}

        void main() {
          vec3 ro = cameraPosition;
          vec3 rd = normalize(vWorldPos - cameraPosition);
          float maxDist = min(75.0, length(vWorldPos - cameraPosition));

          // Step setup: 24 raymarch steps
          const int STEPS = 24;
          float stepSize = maxDist / float(STEPS);
          float t = stepSize * 0.5;

          vec3 sunDir = normalize(uSunPos - ro);
          float cosTheta = max(0.0, dot(rd, sunDir));
          // Mie forward scattering phase function
          float phase = pow(cosTheta, 8.0) * 1.5 + pow(cosTheta, 2.0) * 0.4 + 0.1;

          vec4 accum = vec4(0.0);

          for (int i = 0; i < STEPS; i++) {
            vec3 p = ro + rd * t;

            // Height attenuation: densest near ground, soft wisps rising
            float heightFactor = smoothstep(24.0, -0.5, p.y);

            // 3D Simplex noise animated along Y and time
            vec3 noiseP = p * 0.055 + vec3(0.0, -uTime * 0.04, 0.0);
            float n = snoise(noiseP);
            float n2 = snoise(noiseP * 2.2 + vec3(uTime * 0.02, 0.0, 0.0)) * 0.5;
            float density = max(0.0, (n + n2) * 0.5 + 0.5) * heightFactor * 0.045;

            if (density > 0.001) {
              // Color blend: #0a1f1a (deep shadow) -> #2d5a4a (mid) -> #c9a961 (near light)
              float lightProximity = clamp((phase * 0.75 + smoothstep(4.0, 18.0, p.y) * 0.4), 0.0, 1.0);
              vec3 col = mix(uShadowColor, uMidColor, clamp(heightFactor * 1.2, 0.0, 1.0));
              col = mix(col, uLightColor, lightProximity);
              col = mix(col, uFogWarm, pow(cosTheta, 12.0) * 0.5);

              // Extinction (Beer-Lambert)
              float stepAlpha = 1.0 - exp(-density * stepSize);
              accum.rgb += col * stepAlpha * (1.0 - accum.a);
              accum.a += stepAlpha * (1.0 - accum.a);

              if (accum.a >= 0.96) break;
            }

            t += stepSize;
          }

          gl_FragColor = accum;
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
    <mesh position={[0, 10, -12]}>
      {/* Enclosing bounding box for raymarched fog */}
      <boxGeometry args={[76, 36, 110]} />
      <primitive object={fogMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
