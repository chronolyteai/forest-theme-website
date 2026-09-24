'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/Navbar';
import { HeroSection } from '@/components/ui/HeroSection';
import { AboutSection } from '@/components/ui/AboutSection';
import { FeaturesSection } from '@/components/ui/FeaturesSection';
import { CtaSection } from '@/components/ui/CtaSection';
import { GrowingVineScroll } from '@/components/ui/GrowingVineScroll';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { AudioController } from '@/components/ui/AudioController';
import { useForestStore } from '@/store/useForestStore';

// Dynamically import Three.js Canvas with SSR disabled to prevent hydration mismatch
const ForestCanvas = dynamic(
  () => import('@/components/canvas/Scene').then((mod) => mod.ForestCanvas),
  { ssr: false }
);

export default function Home() {
  const setScrollProgress = useForestStore((s) => s.setScrollProgress);
  const screenShake = useForestStore((s) => s.screenShake);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync scroll progress smoothly
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = window.scrollY / totalHeight;
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollProgress]);

  // Subtle DOM screen shake during section threshold transitions
  const shakeX = screenShake > 0.01 ? (Math.random() - 0.5) * screenShake * 10 : 0;
  const shakeY = screenShake > 0.01 ? (Math.random() - 0.5) * screenShake * 8 : 0;

  return (
    <main
      ref={containerRef}
      className="relative min-h-[400vh] bg-[#030d08] text-white overflow-x-hidden"
      style={{
        transform: screenShake > 0.01 ? `translate3d(${shakeX}px, ${shakeY}px, 0)` : undefined,
      }}
    >
      {/* 3D WebGL Canvas Layer (Fixed full screen background) */}
      <ForestCanvas />

      {/* Film Grain Texture Overlay */}
      <div className="cinematic-grain" />

      {/* Deep Forest Vignette Shadow */}
      <div className="cinematic-vignette" />

      {/* Web Audio Engine Controller */}
      <AudioController />

      {/* Custom Spore Trail Cursor */}
      <CustomCursor />

      {/* Growing Organic Vine Scroll Indicator */}
      <GrowingVineScroll />

      {/* Glassmorphic Navigation Bar */}
      <Navbar />

      {/* Story Sections (Scroll-Driven Journey) */}
      <div className="relative z-20 w-full">
        {/* Section 01: Hero — "Enter the Wild" */}
        <HeroSection />

        {/* Section 02: About — "The Living Sanctuary" */}
        <AboutSection />

        {/* Section 03: Features — "Echoes of the Canopy" */}
        <FeaturesSection />

        {/* Section 04: CTA — "Let's Build Your World" */}
        <CtaSection />
      </div>

      {/* Initial Asset Loading Screen */}
      <LoadingScreen />
    </main>
  );
}
