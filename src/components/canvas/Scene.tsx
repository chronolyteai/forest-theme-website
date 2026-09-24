'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AtmosphericSun } from './AtmosphericSun';
import { GodRays } from './GodRays';
import { VolumetricFog } from './VolumetricFog';
import { ForestTerrain } from './ForestTerrain';
import { ReflectiveStream } from './ReflectiveStream';
import { InstancedTrees } from './InstancedTrees';
import { Fireflies } from './Fireflies';
import { SpiritDeer } from './SpiritDeer';
import { CameraFlight } from './CameraFlight';
import { PostEffects } from './PostEffects';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

function ForestEnvironment() {
  const triggerBurst = useForestStore((s) => s.triggerBurst);

  // Click scene to burst fireflies
  const handlePointerDown = (e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    e.stopPropagation();
    triggerBurst(e.point.x, Math.max(1.0, e.point.y), e.point.z);
    forestAudio.playBurstChime();
  };

  return (
    <group onPointerDown={handlePointerDown}>
      {/* Exponential depth fog blending exact palette #0a1f1a */}
      <fog attach="fog" args={['#0a1f1a', 8, 62]} />

      {/* Atmospheric Directional Sun (#c9a961 to #ffb347) */}
      <directionalLight
        position={[14, 22, -42]}
        intensity={3.2}
        color="#c9a961"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={0.5}
        shadow-camera-far={75}
      />

      {/* Deep Shadow Ambient Fill (#0a1f1a) */}
      <ambientLight intensity={0.45} color="#0a1f1a" />

      {/* Canopy Hemispherical Light: Sky #4a7a6a to Ground #0a1f1a */}
      <hemisphereLight
        args={['#4a7a6a', '#0a1f1a', 0.65]}
        position={[0, 20, 0]}
      />

      {/* Warm Amber Sun Rim Accent (#ffb347) */}
      <directionalLight
        position={[-12, 14, 8]}
        intensity={0.45}
        color="#ffb347"
      />

      {/* Core 3D Elements */}
      <AtmosphericSun />
      <GodRays />
      <VolumetricFog />
      <ReflectiveStream />
      <ForestTerrain />
      <InstancedTrees />
      <SpiritDeer />
      <Fireflies />

      {/* Camera Controller with FOV 35, CatmullRom path & tree collision */}
      <CameraFlight />

      {/* 7-Layer Post-Processing Stack */}
      <PostEffects />
    </group>
  );
}

export function ForestCanvas() {
  const setLoadingProgress = useForestStore((s) => s.setLoadingProgress);
  const setIsLoaded = useForestStore((s) => s.setIsLoaded);
  const setIsMobile = useForestStore((s) => s.setIsMobile);

  // Performance rule: Detect hardwareConcurrency and screen width
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLowEnd =
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        window.innerWidth < 768;
      setIsMobile(Boolean(isLowEnd));
    }
  }, [setIsMobile]);

  // Asset initialization loader
  useEffect(() => {
    let progress = 12;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 16) + 7;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLoadingProgress(100);
        setTimeout(() => setIsLoaded(true), 400);
      } else {
        setLoadingProgress(progress);
      }
    }, 110);

    return () => clearInterval(interval);
  }, [setLoadingProgress, setIsLoaded]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto bg-[#0a1f1a]">
      <Canvas
        shadows
        dpr={[1, typeof window !== 'undefined' && window.devicePixelRatio > 1.5 ? 1.5 : 1]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{
          position: [0, 3.2, 18],
          fov: 35, // MANDATED: Base FOV 35 (cinematic, NOT 75)
          near: 0.1,
          far: 90,
        }}
      >
        <Suspense fallback={null}>
          <ForestEnvironment />
        </Suspense>
      </Canvas>
    </div>
  );
}
