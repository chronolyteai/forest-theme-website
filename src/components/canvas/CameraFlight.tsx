'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useForestStore } from '@/store/useForestStore';

/**
 * CameraFlight:
 * Controls the cinematic camera flight through the ancient forest corridor.
 * Interpolates smoothly along a 3D spline as the user scrolls, while blending:
 * - Subtle mouse parallax
 * - Cinematic screen shake on section transitions
 * - Dynamic focal look-at tracking
 */
export function CameraFlight() {
  const scrollProgress = useForestStore((s) => s.scrollProgress);
  const mouse = useForestStore((s) => s.mouse);
  const screenShake = useForestStore((s) => s.screenShake);
  const decayScreenShake = useForestStore((s) => s.decayScreenShake);

  // Define the camera flight spline path (6 key points across the 4 sections)
  const { pathCurve, lookAtCurve } = useMemo(() => {
    // Camera positions:
    // 0.0 (Hero): Deep forest entrance archway [0, 3.4, 18]
    // 0.2 (Hero push): Through the ancient moss corridor [0.2, 2.8, 10]
    // 0.42 (About): Low glide skimming directly over the reflective stream [-2.4, 1.25, 1.8]
    // 0.65 (Features): Arc into glade viewing the firefly constellation [3.6, 3.5, -4.2]
    // 0.85 (CTA begin): Ascending through sunbeam canopy [1.2, 6.0, 5.0]
    // 1.0 (CTA climax): High majestic panoramic dusk crane shot [0.0, 8.8, 13.5]
    const camPoints = [
      new THREE.Vector3(0.0, 3.4, 18.0),
      new THREE.Vector3(0.2, 2.8, 10.0),
      new THREE.Vector3(-2.4, 1.25, 1.8),
      new THREE.Vector3(3.6, 3.5, -4.2),
      new THREE.Vector3(1.2, 6.0, 5.0),
      new THREE.Vector3(0.0, 8.8, 13.5),
    ];

    const targetPoints = [
      new THREE.Vector3(0.0, 2.0, -8.0),
      new THREE.Vector3(0.1, 1.8, -8.0),
      new THREE.Vector3(0.2, 1.35, -7.5),
      new THREE.Vector3(0.5, 2.2, -9.0),
      new THREE.Vector3(0.0, 2.2, -14.0),
      new THREE.Vector3(0.0, 2.2, -20.0),
    ];

    return {
      pathCurve: new THREE.CatmullRomCurve3(camPoints, false, 'catmullrom', 0.4),
      lookAtCurve: new THREE.CatmullRomCurve3(targetPoints, false, 'catmullrom', 0.4),
    };
  }, []);

  const currentCamPos = useRef(new THREE.Vector3(0, 3.4, 18));
  const currentLookAt = useRef(new THREE.Vector3(0, 2.0, -8));
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }, delta) => {
    // Decay screen shake
    decayScreenShake(delta);

    // Sample curves at current scroll progress (clamped 0 to 1)
    const t = Math.max(0.0001, Math.min(0.9999, scrollProgress));
    pathCurve.getPoint(t, tempPos);
    lookAtCurve.getPoint(t, tempLook);

    // Mouse parallax offsets (gentle, cinematic weight)
    const mouseOffsetX = mouse.x * 0.75;
    const mouseOffsetY = mouse.y * 0.5;

    // Screen shake jitter
    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0.001) {
      const shakeTime = clock.getElapsedTime() * 45;
      shakeX = Math.sin(shakeTime) * screenShake * 0.22;
      shakeY = Math.cos(shakeTime * 1.3) * screenShake * 0.18;
    }

    // Target positions with parallax and shake
    const targetCamX = tempPos.x + mouseOffsetX + shakeX;
    const targetCamY = tempPos.y + mouseOffsetY + shakeY;
    const targetCamZ = tempPos.z;

    const targetLookX = tempLook.x + mouseOffsetX * 0.35 + shakeX * 0.5;
    const targetLookY = tempLook.y + mouseOffsetY * 0.25 + shakeY * 0.5;
    const targetLookZ = tempLook.z;

    // Smooth exponential damping (damping factor 3.2 for weighted fluid camera movement)
    currentCamPos.current.x = THREE.MathUtils.damp(currentCamPos.current.x, targetCamX, 3.2, delta);
    currentCamPos.current.y = THREE.MathUtils.damp(currentCamPos.current.y, targetCamY, 3.2, delta);
    currentCamPos.current.z = THREE.MathUtils.damp(currentCamPos.current.z, targetCamZ, 3.2, delta);

    currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookX, 3.5, delta);
    currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookY, 3.5, delta);
    currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookZ, 3.5, delta);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);

    // Subtle bank roll when moving mouse sideways
    camera.rotation.z = THREE.MathUtils.damp(
      camera.rotation.z,
      -mouse.x * 0.02,
      2.5,
      delta
    );
  });

  return null;
}
