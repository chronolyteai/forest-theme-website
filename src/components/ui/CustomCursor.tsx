'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForestStore } from '@/store/useForestStore';

interface Spore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export function CustomCursor() {
  const setMouse = useForestStore((s) => s.setMouse);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerDevice, setIsPointerDevice] = useState(false);

  const mousePos = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const spores = useRef<Spore[]>([]);

  useEffect(() => {
    // Only enable custom cursor if device supports fine hover pointer
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsPointerDevice(true);
      document.body.classList.add('custom-cursor-active');
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      // Update normalized coordinates (-1 to 1) for 3D camera parallax
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse(normX, normY, e.clientX, e.clientY);

      // Emit new spores along the motion trail
      const speed = Math.hypot(e.movementX, e.movementY);
      const sporeCount = Math.min(3, Math.floor(speed * 0.25) + 1);

      const colors = ['#fde68a', '#f59e0b', '#6ee7b7', '#a7f3d0', '#ffffff'];
      for (let i = 0; i < sporeCount; i++) {
        spores.current.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.5 - e.movementX * 0.08,
          vy: (Math.random() - 0.5) * 1.5 - e.movementY * 0.08 - 0.3, // gently rise
          size: 1.5 + Math.random() * 2.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.85,
          decay: 0.015 + Math.random() * 0.02,
        });
      }

      // Cap active spores for top performance
      if (spores.current.length > 80) {
        spores.current.splice(0, spores.current.length - 80);
      }
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

  // Canvas render loop for trailing spores
  useEffect(() => {
    if (!isPointerDevice) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Damp ring position towards mouse
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.22;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.22;

      // Draw and update glowing spore trail
      for (let i = spores.current.length - 1; i >= 0; i--) {
        const s = spores.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          spores.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isPointerDevice]);

  if (!isPointerDevice || !isVisible) return null;

  return (
    <>
      {/* Spores Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Main Cursor Element */}
      <div
        className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          left: `${mousePos.current.x}px`,
          top: `${mousePos.current.y}px`,
        }}
      >
        {/* Sharp Center Dot */}
        <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(253,211,77,0.9)]" />
      </div>

      {/* Damped Outer Halo Ring */}
      <div
        className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${ringPos.current.x}px`,
          top: `${ringPos.current.y}px`,
        }}
      >
        <div className="w-8 h-8 rounded-full border border-emerald-400/50 shadow-[0_0_15px_rgba(110,231,183,0.35)] animate-pulse-slow" />
      </div>
    </>
  );
}
