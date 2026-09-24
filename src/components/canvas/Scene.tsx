'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ForestTerrain } from './ForestTerrain';
import { ReflectiveStream } from './ReflectiveStream';
import { InstancedTrees } from './InstancedTrees';
import { VolumetricLightRays } from './VolumetricLightRays';
import { GroundMist } from './GroundMist';
import { Fireflies } from './Fireflies';
import { FallingLeaves } from './FallingLeaves';
import { SpiritCreature } from './SpiritCreature';
import { CameraFlight } from './CameraFlight';
import { PostEffects } from './PostEffects';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

function ForestEnvironment() {
  const triggerBurst = useForestStore((s) => s.triggerBurst);

  // Scene pointer click handler for burst sparks
  const handlePointerDown = (e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    e.stopPropagation();
    triggerBurst(e.point.x, Math.max(1.0, e.point.y), e.point.z);
    forestAudio.playBurstChime();
  };

  return (
    <group onPointerDown={handlePointerDown}>
      {/* Mystical Forest Fog */}
      <fog attach="fog" args={['#051912', 6, 52]} />

      {/* Atmospheric Lighting */}
      {/* 1. Golden Hour Sun (piercing through canopy from upper right) */}
      <directionalLight
        position={[18, 30, -18]}
        intensity={2.8}
        color="#ffc368"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
      />

      {/* 2. Deep Teal Ambient Fill (cool shadows contrasting warm sunbeams) */}
      <ambientLight intensity={0.55} color="#0d3238" />

      {/* 3. Forest Hemispherical Light (Canopy emerald to damp soil) */}
      <hemisphereLight
        args={['#164a38', '#04110b', 0.65]}
        position={[0, 20, 0]}
      />

      {/* 4. Warm Sun Rim Accent */}
      <directionalLight
        position={[-12, 12, 10]}
        intensity={0.45}
        color="#fcd34d"
      />

      {/* Core 3D Components */}
      <ReflectiveStream />
      <ForestTerrain />
      <InstancedTrees />
      <VolumetricLightRays />
      <GroundMist />
      <SpiritCreature />
      <FallingLeaves />
      <Fireflies />

      {/* Cinematic Camera Controller */}
      <CameraFlight />

      {/* Post Processing Effects */}
      <PostEffects />
    </group>
  );
}

export function ForestCanvas() {
  const setLoadingProgress = useForestStore((s) => s.setLoadingProgress);
  const setIsLoaded = useForestStore((s) => s.setIsLoaded);

  // Progressive loader simulation for initial asset generation
  useEffect(() => {
    let progress = 10;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLoadingProgress(100);
        setTimeout(() => setIsLoaded(true), 400);
      } else {
        setLoadingProgress(progress);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [setLoadingProgress, setIsLoaded]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto bg-[#030d08]">
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
          position: [0, 3.4, 18],
          fov: 46,
          near: 0.1,
          far: 80,
        }}
      >
        <Suspense fallback={null}>
          <ForestEnvironment />
        </Suspense>
      </Canvas>
    </div>
  );
}
