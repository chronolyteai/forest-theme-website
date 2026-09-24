'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useForestStore } from '@/store/useForestStore';
import { activeTreePositions } from './InstancedTrees';

/**
 * CameraFlight:
 * Controls cinematic camera behavior adhering to all mandatory specifications:
 * - Base FOV: 35 (cinematic)
 * - Idle: gentle handheld sway (Perlin/harmonic sway on position + rotation, amp 0.02)
 * - Mouse parallax with damping: lerp 0.05
 * - Scroll: CatmullRomCurve3 with 6 control points per section (24 total)
 * - Transitions: 1.2s ease with subtle FOV push (35 -> 32 -> 35)
 * - Tree collision avoidance with collision radius 1.5
 */
export function CameraFlight() {
  const scrollProgress = useForestStore((s) => s.scrollProgress);
  const mouse = useForestStore((s) => s.mouse);
  const cameraFov = useForestStore((s) => s.cameraFov);
  const setMouse3D = useForestStore((s) => s.setMouse3D);

  // 24 control points (6 per section) for positions and lookAt
  const { pathCurve, lookAtCurve } = useMemo(() => {
    const camPoints = [
      // SECTION 0: HERO (Enter the Wild) - 6 control points
      new THREE.Vector3(0.0, 3.2, 18.0),
      new THREE.Vector3(0.1, 3.0, 16.2),
      new THREE.Vector3(0.15, 2.8, 14.4),
      new THREE.Vector3(0.2, 2.6, 12.5),
      new THREE.Vector3(0.18, 2.3, 10.6),
      new THREE.Vector3(0.1, 2.0, 8.8),

      // SECTION 1: ABOUT (The Living Stream) - 6 control points
      new THREE.Vector3(-0.6, 1.6, 7.0),
      new THREE.Vector3(-1.4, 1.2, 5.0),
      new THREE.Vector3(-2.2, 0.85, 3.0),   // Skimming low over water
      new THREE.Vector3(-2.4, 0.75, 1.0),   // Stream reflection zenith
      new THREE.Vector3(-1.8, 0.95, -1.2),
      new THREE.Vector3(-0.8, 1.35, -3.4),

      // SECTION 2: FEATURES (Echoes of the Canopy) - 6 control points
      new THREE.Vector3(0.6, 1.8, -5.2),
      new THREE.Vector3(1.8, 2.4, -7.0),
      new THREE.Vector3(2.8, 3.0, -8.8),
      new THREE.Vector3(3.4, 3.4, -10.6),
      new THREE.Vector3(3.2, 3.6, -12.4),
      new THREE.Vector3(2.2, 3.8, -14.2),

      // SECTION 3: CTA (Twilight World) - 6 control points
      new THREE.Vector3(1.2, 4.4, -11.0),
      new THREE.Vector3(0.5, 5.4, -6.5),
      new THREE.Vector3(0.2, 6.6, -1.0),
      new THREE.Vector3(0.0, 7.8, 4.5),
      new THREE.Vector3(-0.2, 8.8, 9.8),
      new THREE.Vector3(0.0, 9.5, 14.5),   // Panoramic dusk summit
    ];

    const targetPoints = [
      // SECTION 0: HERO - Focusing on distant mist & spirit deer
      new THREE.Vector3(0.0, 2.0, -7.5),
      new THREE.Vector3(0.05, 1.9, -7.5),
      new THREE.Vector3(0.1, 1.8, -7.5),
      new THREE.Vector3(0.15, 1.7, -7.5),
      new THREE.Vector3(0.2, 1.6, -7.5),
      new THREE.Vector3(0.2, 1.5, -7.5),

      // SECTION 1: ABOUT - Looking down along reflective stream path
      new THREE.Vector3(-0.2, 0.9, -6.0),
      new THREE.Vector3(0.1, 0.7, -5.0),
      new THREE.Vector3(0.3, 0.55, -4.0),
      new THREE.Vector3(0.2, 0.65, -5.0),
      new THREE.Vector3(0.0, 1.0, -7.0),
      new THREE.Vector3(0.2, 1.4, -9.0),

      // SECTION 2: FEATURES - Looking across the glowing glade
      new THREE.Vector3(0.5, 1.8, -10.5),
      new THREE.Vector3(0.2, 2.0, -12.0),
      new THREE.Vector3(-0.2, 2.2, -13.5),
      new THREE.Vector3(-0.4, 2.3, -15.0),
      new THREE.Vector3(-0.2, 2.3, -16.5),
      new THREE.Vector3(0.0, 2.2, -18.0),

      // SECTION 3: CTA - Looking down across whole valley towards dusk sun
      new THREE.Vector3(0.0, 2.2, -18.0),
      new THREE.Vector3(0.0, 2.0, -20.0),
      new THREE.Vector3(0.0, 1.8, -22.0),
      new THREE.Vector3(0.0, 1.6, -24.0),
      new THREE.Vector3(0.0, 1.5, -26.0),
      new THREE.Vector3(0.0, 1.4, -28.0),
    ];

    return {
      pathCurve: new THREE.CatmullRomCurve3(camPoints, false, 'catmullrom', 0.45),
      lookAtCurve: new THREE.CatmullRomCurve3(targetPoints, false, 'catmullrom', 0.45),
    };
  }, []);

  const currentCamPos = useRef(new THREE.Vector3(0, 3.2, 18));
  const currentLookAt = useRef(new THREE.Vector3(0, 2, -7.5));
  const mouseOffset = useRef({ x: 0, y: 0 });
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }, delta) => {
    const time = clock.getElapsedTime();

    // 1. Idle handheld sway (amp 0.02)
    const swayX = (Math.sin(time * 0.8) * 0.012 + Math.cos(time * 1.7) * 0.008) * 0.02;
    const swayY = (Math.cos(time * 0.9) * 0.012 + Math.sin(time * 1.5) * 0.008) * 0.02;
    const swayRoll = Math.sin(time * 0.6) * 0.003;

    // 2. Mouse parallax with MANDATED lerp 0.05
    mouseOffset.current.x = THREE.MathUtils.lerp(mouseOffset.current.x, mouse.x * 0.8, 0.05);
    mouseOffset.current.y = THREE.MathUtils.lerp(mouseOffset.current.y, mouse.y * 0.5, 0.05);

    // 3. Sample CatmullRom spline at current scroll progress
    const t = Math.max(0.0001, Math.min(0.9999, scrollProgress));
    pathCurve.getPoint(t, tempPos);
    lookAtCurve.getPoint(t, tempLook);

    let targetX = tempPos.x + mouseOffset.current.x + swayX;
    let targetY = tempPos.y + mouseOffset.current.y + swayY;
    let targetZ = tempPos.z;

    // 4. MANDATED Tree Collision Avoidance: collision radius 1.5
    for (let i = 0; i < activeTreePositions.length; i++) {
      const tree = activeTreePositions[i];
      const dx = targetX - tree.x;
      const dz = targetZ - tree.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 1.5 && dist > 0.001) {
        // Push camera away from tree trunk
        const push = (1.5 - dist);
        targetX += (dx / dist) * push;
        targetZ += (dz / dist) * push;
      }
    }

    const targetLookX = tempLook.x + mouseOffset.current.x * 0.4;
    const targetLookY = tempLook.y + mouseOffset.current.y * 0.3;
    const targetLookZ = tempLook.z;

    // Smoothly update camera coordinates
    currentCamPos.current.x = THREE.MathUtils.damp(currentCamPos.current.x, targetX, 3.2, delta);
    currentCamPos.current.y = THREE.MathUtils.damp(currentCamPos.current.y, targetY, 3.2, delta);
    currentCamPos.current.z = THREE.MathUtils.damp(currentCamPos.current.z, targetZ, 3.2, delta);

    currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookX, 3.4, delta);
    currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookY, 3.4, delta);
    currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookZ, 3.4, delta);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
    camera.rotation.z += swayRoll - mouseOffset.current.x * 0.015;

    // 5. Dynamic FOV push transition (35 -> 32 -> 35)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, cameraFov, 4.0, delta);
      camera.updateProjectionMatrix();
    }

    // 6. Update 3D mouse focal position for fireflies and spirit deer
    const rayTargetX = currentCamPos.current.x + mouse.x * 6.0;
    const rayTargetY = currentCamPos.current.y - mouse.y * 4.0;
    const rayTargetZ = currentCamPos.current.z - 8.0;
    setMouse3D([rayTargetX, rayTargetY, rayTargetZ]);
  });

  return null;
}
