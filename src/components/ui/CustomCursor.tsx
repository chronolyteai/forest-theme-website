'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForestStore } from '@/store/useForestStore';

/**
 * CustomCursor:
 * - 8px glowing dot
 * - 40px trailing ring with mix-blend-mode: screen
 * - Damped lerp movement
 */
export function CustomCursor() {
  const setMouse = useForestStore((s) => s.setMouse);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerDevice, setIsPointerDevice] = useState(false);

  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const ringElRef = useRef<HTMLDivElement>(null);
  const dotElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsPointerDevice(true);
      document.body.classList.add('custom-cursor-active');
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      dotPos.current.x = e.clientX;
      dotPos.current.y = e.clientY;

      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse(normX, normY, e.clientX, e.clientY);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [setMouse, isVisible]);

  // Smooth 60fps damping loop
  useEffect(() => {
    if (!isPointerDevice) return;
    let animId: number;

    const render = () => {
      ringPos.current.x += (dotPos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (dotPos.current.y - ringPos.current.y) * 0.18;

      if (dotElRef.current) {
        dotElRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringElRef.current) {
        ringElRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPointerDevice]);

  if (!isPointerDevice || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" style={{ mixBlendMode: 'screen' }}>
      {/* 8px Glowing Dot */}
      <div
        ref={dotElRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#ffb347] shadow-[0_0_12px_#ffb347] pointer-events-none"
      />

      {/* 40px Trailing Ring */}
      <div
        ref={ringElRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-[#7fffcf]/60 shadow-[0_0_18px_rgba(127,255,207,0.35)] pointer-events-none"
      />
    </div>
  );
}
