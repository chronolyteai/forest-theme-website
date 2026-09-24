'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

/**
 * SpiritCreature:
 * The sacred celestial stag guardian residing at the center of the forest stream.
 * Features:
 * - Sculpted spirit deer anatomy (torso, noble neck, head, glowing branching antlers)
 * - Bioluminescent Fresnel spirit shader (deep emerald translucence + celestial gold rim)
 * - Orbiting concentric ethereal energy rings
 * - Audio-reactive pulsating light aura synchronized with ambient forest soundscape
 * - Point light casting dynamic reflections onto the water surface
 */
export function SpiritCreature() {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  const audioEnergy = useForestStore((s) => s.audioEnergy);
  const triggerBurst = useForestStore((s) => s.triggerBurst);

  // Bioluminescent Spirit Shader for the creature
  const spiritMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0.35 },
        uCoreColor: { value: new THREE.Color('#0a3e30') },
        uRimColor: { value: new THREE.Color('#ffd875') },
        uAuraColor: { value: new THREE.Color('#5eead4') },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying vec3 vWorldPos;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vec4 mvPos = viewMatrix * worldPos;
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uEnergy;
        uniform vec3 uCoreColor;
        uniform vec3 uRimColor;
        uniform vec3 uAuraColor;

        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying vec3 vWorldPos;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPos);

          // Fresnel edge glow
          float fresnel = 1.0 - max(0.0, dot(N, V));
          float rim = pow(fresnel, 2.2);
          float intenseRim = pow(fresnel, 4.5);

          // Audio-reactive pulse wave
          float pulse = sin(uTime * 2.5 - vWorldPos.y * 3.0) * 0.5 + 0.5;
          pulse *= (0.4 + uEnergy * 0.6);

          vec3 color = mix(uCoreColor, uAuraColor, rim * 0.7);
          color = mix(color, uRimColor, intenseRim + pulse * 0.25);

          float alpha = clamp(0.45 + rim * 0.55 + pulse * 0.15, 0.0, 1.0);

          gl_FragColor = vec4(color * 1.5, alpha);
        }
      `,
    });
  }, []);

  // Glowing Antlers Material (Pure emissive gold crystal)
  const antlerMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#fef3c7',
      emissive: '#f59e0b',
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.8,
    });
  }, []);

  // Orbiting ring geometry
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(2.2, 0.025, 16, 64), []);
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#fde68a',
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  // Pulsating Outer Aura Sphere
  const auraMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0.35 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uEnergy;
        varying vec3 vNormal;
        varying vec3 vViewPos;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPos);
          float edge = 1.0 - max(0.0, dot(N, V));
          float alpha = pow(edge, 2.8) * (0.2 + uEnergy * 0.25);

          vec3 gold = vec3(0.98, 0.82, 0.45);
          vec3 teal = vec3(0.35, 0.92, 0.78);
          vec3 col = mix(gold, teal, sin(uTime * 1.5) * 0.5 + 0.5);

          gl_FragColor = vec4(col * alpha * 2.0, alpha);
        }
      `,
    });
  }, []);

  // Handle click on spirit creature to trigger burst
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    triggerBurst(0.2, 2.2, -7.5);
    forestAudio.playBurstChime();
  };

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    spiritMaterial.uniforms.uTime.value = time;
    auraMaterial.uniforms.uTime.value = time;

    // Smooth pulse interpolation
    spiritMaterial.uniforms.uEnergy.value = audioEnergy;
    auraMaterial.uniforms.uEnergy.value = audioEnergy;

    // Gentle breathing float
    if (groupRef.current) {
      groupRef.current.position.y = 0.8 + Math.sin(time * 1.4) * 0.08;
    }

    // Dynamic light pulsation
    if (lightRef.current) {
      lightRef.current.intensity = 3.5 + audioEnergy * 3.0 + Math.sin(time * 3.0) * 0.8;
    }

    // Orbiting rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5;
      ring1Ref.current.rotation.y = time * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.4;
      ring2Ref.current.rotation.z = time * 0.35;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -time * 0.3;
      ring3Ref.current.rotation.z = -time * 0.45;
    }

    // Aura scale breathing
    if (auraRef.current) {
      const s = 1.0 + audioEnergy * 0.12 + Math.sin(time * 2.0) * 0.04;
      auraRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0.2, 0.8, -7.5]}
      onClick={handleClick}
    >
      {/* Dynamic point light casting golden amber glow on stream and trees */}
      <pointLight
        ref={lightRef}
        color="#ffe299"
        intensity={4.5}
        distance={22}
        decay={2}
      />

      {/* Orbiting Concentric Energy Rings */}
      <mesh ref={ring1Ref} geometry={ringGeometry} material={ringMaterial} position={[0, 1.6, 0]} />
      <mesh
        ref={ring2Ref}
        geometry={ringGeometry}
        material={ringMaterial}
        position={[0, 1.6, 0]}
        scale={[0.82, 0.82, 0.82]}
      />
      <mesh
        ref={ring3Ref}
        geometry={ringGeometry}
        material={ringMaterial}
        position={[0, 1.6, 0]}
        scale={[1.18, 1.18, 1.18]}
      />

      {/* Pulsating Outer Aura Sphere */}
      <mesh
        ref={auraRef}
        geometry={useMemo(() => new THREE.SphereGeometry(2.4, 32, 32), [])}
        material={auraMaterial}
        position={[0, 1.6, 0]}
      />

      {/* Central Sacred Heart Orb */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshBasicMaterial
          color="#ffd56b"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ethereal Deer Body Anatomy */}
      <group position={[0, 0, 0]}>
        {/* Torso / Barrel */}
        <mesh position={[0, 1.35, 0]} rotation={[0.1, 0, 0]} material={spiritMaterial}>
          <cylinderGeometry args={[0.38, 0.44, 1.4, 16]} />
        </mesh>

        {/* Chest / Rump */}
        <mesh position={[0, 1.45, -0.6]} material={spiritMaterial}>
          <sphereGeometry args={[0.46, 16, 16]} />
        </mesh>
        <mesh position={[0, 1.35, 0.6]} material={spiritMaterial}>
          <sphereGeometry args={[0.42, 16, 16]} />
        </mesh>

        {/* Slender Legs */}
        {/* Front Left */}
        <mesh position={[-0.24, 0.65, -0.55]} rotation={[0.05, 0, 0.05]} material={spiritMaterial}>
          <cylinderGeometry args={[0.07, 0.05, 1.3, 10]} />
        </mesh>
        {/* Front Right */}
        <mesh position={[0.24, 0.65, -0.55]} rotation={[0.05, 0, -0.05]} material={spiritMaterial}>
          <cylinderGeometry args={[0.07, 0.05, 1.3, 10]} />
        </mesh>
        {/* Rear Left */}
        <mesh position={[-0.26, 0.65, 0.55]} rotation={[-0.08, 0, 0.05]} material={spiritMaterial}>
          <cylinderGeometry args={[0.08, 0.05, 1.3, 10]} />
        </mesh>
        {/* Rear Right */}
        <mesh position={[0.26, 0.65, 0.55]} rotation={[-0.08, 0, -0.05]} material={spiritMaterial}>
          <cylinderGeometry args={[0.08, 0.05, 1.3, 10]} />
        </mesh>

        {/* Graceful Arching Neck */}
        <mesh position={[0, 2.05, -0.9]} rotation={[-0.45, 0, 0]} material={spiritMaterial}>
          <cylinderGeometry args={[0.18, 0.28, 0.95, 14]} />
        </mesh>

        {/* Noble Head */}
        <mesh position={[0, 2.45, -1.25]} rotation={[-0.1, 0, 0]} material={spiritMaterial}>
          <coneGeometry args={[0.24, 0.55, 12]} />
        </mesh>

        {/* Delicate Ears */}
        <mesh position={[-0.22, 2.68, -1.15]} rotation={[-0.2, -0.3, -0.4]} material={spiritMaterial}>
          <coneGeometry args={[0.07, 0.28, 8]} />
        </mesh>
        <mesh position={[0.22, 2.68, -1.15]} rotation={[-0.2, 0.3, 0.4]} material={spiritMaterial}>
          <coneGeometry args={[0.07, 0.28, 8]} />
        </mesh>

        {/* Majestic Glowing Antler Crown */}
        <group position={[0, 2.65, -1.18]}>
          {/* Main Left Antler Beam */}
          <mesh position={[-0.32, 0.5, 0.05]} rotation={[-0.2, -0.3, -0.55]} material={antlerMaterial}>
            <cylinderGeometry args={[0.03, 0.065, 1.1, 8]} />
          </mesh>
          {/* Left Tines */}
          <mesh position={[-0.48, 0.4, -0.05]} rotation={[-0.4, -0.5, -0.9]} material={antlerMaterial}>
            <cylinderGeometry args={[0.02, 0.04, 0.45, 6]} />
          </mesh>
          <mesh position={[-0.55, 0.78, 0.1]} rotation={[-0.1, -0.2, -0.7]} material={antlerMaterial}>
            <cylinderGeometry args={[0.02, 0.035, 0.5, 6]} />
          </mesh>
          <mesh position={[-0.35, 0.95, 0.22]} rotation={[0.2, 0.1, -0.3]} material={antlerMaterial}>
            <cylinderGeometry args={[0.015, 0.03, 0.4, 6]} />
          </mesh>

          {/* Main Right Antler Beam */}
          <mesh position={[0.32, 0.5, 0.05]} rotation={[-0.2, 0.3, 0.55]} material={antlerMaterial}>
            <cylinderGeometry args={[0.03, 0.065, 1.1, 8]} />
          </mesh>
          {/* Right Tines */}
          <mesh position={[0.48, 0.4, -0.05]} rotation={[-0.4, 0.5, 0.9]} material={antlerMaterial}>
            <cylinderGeometry args={[0.02, 0.04, 0.45, 6]} />
          </mesh>
          <mesh position={[0.55, 0.78, 0.1]} rotation={[-0.1, 0.2, 0.7]} material={antlerMaterial}>
            <cylinderGeometry args={[0.02, 0.035, 0.5, 6]} />
          </mesh>
          <mesh position={[0.35, 0.95, 0.22]} rotation={[0.2, -0.1, 0.3]} material={antlerMaterial}>
            <cylinderGeometry args={[0.015, 0.03, 0.4, 6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
