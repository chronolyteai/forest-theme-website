'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useForestStore } from '@/store/useForestStore';

/**
 * GrowingVineScroll:
 * Animated SVG vine indicator that grows downward as you scroll.
 * Uses exact mandated palette: #2d5a4a, #c9a961, #ffb347
 */
export function GrowingVineScroll() {
  const scrollProgress = useForestStore((s) => s.scrollProgress);
  const currentSection = useForestStore((s) => s.currentSection);

  const sections = [
    { title: 'Sanctuary', progress: 0.0 },
    { title: 'The Stream', progress: 0.33 },
    { title: 'Canopy Glade', progress: 0.66 },
    { title: 'Twilight Dusk', progress: 1.0 },
  ];

  const handleJump = (targetProgress: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: targetProgress * scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <aside
      aria-label="Chapter progress"
      className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center pointer-events-auto"
    >
      <div className="relative w-8 h-80 flex flex-col items-center justify-between">
        {/* Background Vine Stem SVG */}
        <svg
          viewBox="0 0 32 320"
          className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_8px_rgba(45,90,74,0.4)] pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle guide stem */}
          <path
            d="M16 10 Q12 60 18 110 T14 210 Q20 270 16 310"
            stroke="rgba(45, 90, 74, 0.35)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Growing Green-to-Gold Vine Path */}
          <motion.path
            d="M16 10 Q12 60 18 110 T14 210 Q20 270 16 310"
            stroke="url(#vineGradUE5)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.max(0.04, scrollProgress) }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          />

          {/* Curling Vine Tendrils */}
          <path
            d="M14 65 Q6 60 8 50 Q10 42 16 48"
            stroke="rgba(201, 169, 97, 0.45)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M18 160 Q26 155 24 145 Q22 138 16 144"
            stroke="rgba(201, 169, 97, 0.45)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M15 255 Q8 250 10 240 Q12 232 17 238"
            stroke="rgba(201, 169, 97, 0.45)"
            strokeWidth="1.2"
            fill="none"
          />

          <defs>
            <linearGradient id="vineGradUE5" x1="16" y1="10" x2="16" y2="310" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2d5a4a" />
              <stop offset="0.6" stopColor="#c9a961" />
              <stop offset="1" stopColor="#ffb347" />
            </linearGradient>
          </defs>
        </svg>

        {/* 4 Interactive Leaf Nodes */}
        {sections.map((sec, idx) => {
          const isActive = currentSection === idx;
          const isPassed = scrollProgress >= sec.progress - 0.05;

          return (
            <button
              key={idx}
              onClick={() => handleJump(sec.progress)}
              className="group relative z-10 flex items-center justify-center p-2 focus:outline-none"
              title={`Jump to ${sec.title}`}
              aria-label={`Jump to ${sec.title}`}
            >
              <span className="absolute right-10 whitespace-nowrap px-2.5 py-1 rounded bg-[#0a1f1a]/90 border border-white/10 text-[10px] uppercase tracking-widest text-[#e8dcc4] font-sans opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0 shadow-lg">
                {sec.title}
              </span>

              <div
                className={`relative w-3.5 h-3.5 rounded-full transition-all duration-500 flex items-center justify-center ${
                  isActive
                    ? 'scale-125 bg-[#ffb347] shadow-[0_0_16px_rgba(255,179,71,0.9)] border-2 border-[#fff7e6]'
                    : isPassed
                    ? 'bg-[#c9a961] shadow-[0_0_8px_rgba(201,169,97,0.5)] border border-[#c9a961]'
                    : 'bg-[#0a1f1a] border border-[#2d5a4a]'
                }`}
              >
                <div
                  className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-tr-full transition-colors ${
                    isActive ? 'bg-[#ffb347]' : isPassed ? 'bg-[#c9a961]' : 'bg-transparent'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
