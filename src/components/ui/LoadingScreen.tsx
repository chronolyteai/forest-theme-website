'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

/**
 * LoadingScreen:
 * - Full black screen
 * - A single line of warm gold (#c9a961) draws across, growing a branching tree silhouette from left to right
 * - "Entering the Wild" in Cormorant Garamond, fading in letter by letter
 * - Percentage counter, bottom-right, tabular-nums
 * - On 100%: tree glows with gold flare, screen dissolves into the scene
 */
export function LoadingScreen() {
  const loadingProgress = useForestStore((s) => s.loadingProgress);
  const isLoaded = useForestStore((s) => s.isLoaded);
  const setIsMuted = useForestStore((s) => s.setIsMuted);
  const [hasDissolved, setHasDissolved] = useState(false);

  const title = 'Entering the Wild';

  const handleEnter = () => {
    setIsMuted(false);
    forestAudio.start();
    setHasDissolved(true);
  };

  if (hasDissolved) return null;

  return (
    <AnimatePresence>
      {!hasDissolved && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000000] text-[#e8dcc4] select-none overflow-hidden"
        >
          {/* Subtle warm amber ambient bloom */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#1a3d2e]/30 via-[#c9a961]/15 to-[#ffb347]/10 blur-[100px] pointer-events-none" />

          {/* Center Graphic: Single Gold Line Drawing Across & Growing Branching Tree Silhouette */}
          <div className="relative w-full max-w-xl px-8 flex flex-col items-center">
            <svg
              viewBox="0 0 500 240"
              className={`w-full h-auto filter transition-all duration-700 ${
                loadingProgress >= 95
                  ? 'drop-shadow-[0_0_30px_rgba(255,179,71,0.8)]'
                  : 'drop-shadow-[0_0_12px_rgba(201,169,97,0.35)]'
              }`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Single gold line drawing across from left to right */}
              <motion.path
                d="M 20 180 L 480 180"
                stroke="#c9a961"
                strokeWidth="2.0"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: Math.min(1, loadingProgress / 100) }}
                transition={{ duration: 0.3 }}
              />

              {/* Roots growing below the line */}
              <motion.path
                d="M 250 180 C 240 195 210 205 180 215 M 250 180 C 260 195 290 205 320 215 M 245 185 C 235 200 220 220 205 230 M 255 185 C 265 200 280 220 295 230"
                stroke="#c9a961"
                strokeWidth="1.6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: Math.min(1, Math.max(0, (loadingProgress - 15) / 40)),
                  opacity: loadingProgress > 15 ? 0.8 : 0,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Main Ancient Trunk rising from line */}
              <motion.path
                d="M 245 180 C 247 140 244 110 248 70 M 255 180 C 253 140 256 110 252 70 M 250 130 L 250 60"
                stroke="#c9a961"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: Math.min(1, Math.max(0, (loadingProgress - 30) / 40)),
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Left Branching Silhouette */}
              <motion.path
                d="M 248 135 C 230 120 205 125 180 105 M 205 122 C 190 105 175 95 155 90 M 246 100 C 220 85 205 65 190 45 M 218 85 C 205 70 195 60 180 50"
                stroke="#c9a961"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: Math.min(1, Math.max(0, (loadingProgress - 45) / 45)),
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Right Branching Silhouette */}
              <motion.path
                d="M 252 135 C 270 120 295 125 320 105 M 295 122 C 310 105 325 95 345 90 M 254 100 C 280 85 295 65 310 45 M 282 85 C 295 70 305 60 320 50"
                stroke="#c9a961"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: Math.min(1, Math.max(0, (loadingProgress - 45) / 45)),
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Delicate Canopy Twigs & Crown */}
              <motion.path
                d="M 250 60 C 240 40 245 25 250 15 C 255 25 260 40 250 60 Z M 190 45 C 180 35 182 25 188 20 M 310 45 C 320 35 318 25 312 20"
                stroke="#ffb347"
                strokeWidth="1.4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: Math.min(1, Math.max(0, (loadingProgress - 70) / 30)),
                  opacity: loadingProgress > 70 ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Glowing Heart Spore on 100% */}
              {loadingProgress >= 90 && (
                <motion.circle
                  cx="250"
                  cy="95"
                  r="5"
                  fill="#ffb347"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
            </svg>

            {/* "Entering the Wild" in Cormorant, fading in letter by letter */}
            <div className="mt-8 flex justify-center space-x-[0.18em] font-serif text-3xl sm:text-4xl font-extralight tracking-wider text-[#e8dcc4]">
              {title.split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: loadingProgress > index * 5 ? 1 : 0,
                    y: loadingProgress > index * 5 ? 0 : 15,
                  }}
                  transition={{ duration: 0.5 }}
                  className={char === ' ' ? 'mr-3' : ''}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Initiate Button on 100% */}
            {isLoaded ? (
              <motion.button
                onClick={handleEnter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="mt-8 px-8 py-3 rounded-full border border-[#c9a961]/70 bg-[#c9a961]/10 backdrop-blur-md text-[#e8dcc4] font-serif text-lg tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#c9a961]/25 hover:shadow-[0_0_30px_rgba(201,169,97,0.4)]"
              >
                <span>Step Into the Light →</span>
              </motion.button>
            ) : (
              <div className="mt-6 text-[10px] tracking-[0.35em] uppercase text-[#c9a961]/60 font-sans">
                Raymarching Volumetric Atmosphere
              </div>
            )}
          </div>

          {/* Percentage Counter, bottom-right, tabular-nums in Cormorant Garamond */}
          <div className="absolute bottom-10 right-10 flex items-baseline space-x-1 font-serif text-[#c9a961]">
            <span className="text-5xl sm:text-6xl font-light tabular-nums">
              {Math.round(loadingProgress)}
            </span>
            <span className="text-xl font-light">%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
