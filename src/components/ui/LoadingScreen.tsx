'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

export function LoadingScreen() {
  const loadingProgress = useForestStore((s) => s.loadingProgress);
  const isLoaded = useForestStore((s) => s.isLoaded);
  const setIsMuted = useForestStore((s) => s.setIsMuted);
  const [hasEntered, setHasEntered] = useState(false);

  // Background floating dust particles for the loader
  const dustParticles = [
    { top: '25%', left: '20%', size: 3, delay: 0 },
    { top: '35%', left: '75%', size: 4, delay: 0.5 },
    { top: '65%', left: '30%', size: 2.5, delay: 1 },
    { top: '70%', left: '80%', size: 3.5, delay: 0.3 },
    { top: '45%', left: '50%', size: 4.5, delay: 0.8 },
    { top: '80%', left: '15%', size: 3, delay: 1.2 },
  ];

  const handleEnter = () => {
    setHasEntered(true);
    // Unmute and initiate audio context on this primary user interaction
    setIsMuted(false);
    forestAudio.start();
  };

  if (hasEntered) return null;

  return (
    <AnimatePresence>
      {!hasEntered && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030d08] text-emerald-100 select-none overflow-hidden"
        >
          {/* Subtle ambient glow behind tree silhouette */}
          <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-emerald-950/40 via-amber-500/10 to-teal-500/15 blur-[90px] pointer-events-none" />

          {/* Floating dust motes */}
          {dustParticles.map((p, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full bg-amber-200/50 blur-[0.5px] pointer-events-none"
              style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
              animate={{
                y: [-8, 8, -8],
                x: [-4, 4, -4],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: 4 + idx,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
            {/* Animated Growing Forest Silhouette SVG */}
            <div className="relative w-48 h-48 mb-6">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full filter drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Ancient Roots Network */}
                <motion.path
                  d="M100 170 C90 180 70 185 50 190 M100 170 C110 180 130 185 150 190 M100 175 C85 185 75 195 65 200 M100 175 C115 185 125 195 135 200"
                  stroke="#268a65"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: Math.min(1, loadingProgress / 40),
                    opacity: 0.8,
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Central Mighty Trunk */}
                <motion.path
                  d="M93 175 L95 110 L90 85 M107 175 L105 110 L110 85 M100 120 L100 75"
                  stroke="#fcd34d"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: Math.min(1, Math.max(0, (loadingProgress - 20) / 45)),
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Left Branch Architecture */}
                <motion.path
                  d="M95 120 C80 110 65 115 50 100 M65 112 C55 95 45 90 35 85 M93 95 C75 80 65 65 55 50 M75 80 C68 68 62 60 52 52"
                  stroke="#3eb88a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: Math.min(1, Math.max(0, (loadingProgress - 40) / 45)),
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Right Branch Architecture */}
                <motion.path
                  d="M105 120 C120 110 135 115 150 100 M135 112 C145 95 155 90 165 85 M107 95 C125 80 135 65 145 50 M125 80 C132 68 138 60 148 52"
                  stroke="#3eb88a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: Math.min(1, Math.max(0, (loadingProgress - 40) / 45)),
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Majestic Sacred Canopy Crown */}
                <motion.path
                  d="M100 75 C85 60 90 40 100 25 C110 40 115 60 100 75 Z"
                  fill="url(#canopyGrad)"
                  stroke="#ffdf85"
                  strokeWidth="1.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: loadingProgress >= 85 ? 1 : loadingProgress / 100,
                    opacity: loadingProgress >= 70 ? 1 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Radiant Spirit Heart */}
                <motion.circle
                  cx="100"
                  cy="105"
                  r="6"
                  fill="#ffd770"
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <defs>
                  <linearGradient id="canopyGrad" x1="100" y1="25" x2="100" y2="75" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop stopColor="#0f4430" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-xs uppercase tracking-[0.45em] text-emerald-400 font-sans font-medium mb-3"
            >
              Chronolyte • Sylvane
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif italic text-2xl text-amber-100/90 mb-6"
            >
              Awakening the ancient biome…
            </motion.p>

            {/* Progress Percentage Display */}
            <div className="flex items-baseline space-x-1 mb-6 font-serif">
              <span className="text-5xl font-light tracking-tight text-amber-200">
                {Math.round(loadingProgress)}
              </span>
              <span className="text-xl text-emerald-400 font-light">%</span>
            </div>

            {/* Elegant Slim Progress Bar */}
            <div className="w-56 h-[2px] bg-emerald-950/80 rounded-full overflow-hidden mb-8 border border-emerald-900/40">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-200"
                style={{ width: `${loadingProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>

            {/* Enter Button (once assets are ready) */}
            {isLoaded ? (
              <motion.button
                onClick={handleEnter}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="group relative px-8 py-3 rounded-full overflow-hidden border border-amber-300/60 bg-gradient-to-r from-emerald-900/60 via-amber-950/40 to-emerald-900/60 backdrop-blur-md text-amber-100 font-serif text-lg tracking-widest transition-all duration-300 shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:border-amber-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.45)]"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>ENTER THE WILD</span>
                  <span className="text-amber-300 transition-transform group-hover:translate-x-1">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>
            ) : (
              <div className="text-xs uppercase tracking-widest text-emerald-600/80 font-sans">
                Synthesizing flora & light shafts
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
