'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function HeroSection() {
  const titleText = 'ENTER THE WILD';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.4,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between px-6 sm:px-12 py-24 select-none pointer-events-none">
      {/* Top Header Tag */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs tracking-[0.3em] uppercase text-emerald-300/80 font-sans mt-4"
      >
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-amber-200/90 font-medium">Ancient Biome // Sector 01</span>
        </div>
        <div className="mt-2 sm:mt-0 text-emerald-400/60 font-mono text-[11px]">
          64°08&apos;42&quot;N 19°42&apos;18&quot;W • EL. 420M
        </div>
      </motion.div>

      {/* Massive Cinematic Title with Letter-by-Letter Stagger */}
      <div className="my-auto max-w-5xl">
        {/* Subheading */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="inline-flex items-center space-x-3 px-3.5 py-1.5 rounded-full border border-amber-300/30 bg-emerald-950/40 backdrop-blur-md mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <span className="text-xs uppercase tracking-[0.25em] text-amber-200 font-sans font-medium">
            Immersive 3D Experience
          </span>
        </motion.div>

        {/* Letter-by-letter Title Reveal */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-white leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
        >
          {titleText.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className={`inline-block ${
                char === ' ' ? 'mr-4 sm:mr-6' : ''
              } bg-gradient-to-b from-white via-amber-100 to-amber-200/80 bg-clip-text text-transparent`}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Narrative Lead Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.1 }}
          className="mt-8 max-w-xl text-base sm:text-lg text-emerald-100/80 font-sans font-light leading-relaxed backdrop-blur-xs"
        >
          Step beyond the threshold into a breathing primeval sanctuary. Where
          golden hour sunbeams pierce a dense redwood canopy and the sacred stag
          walks the reflective stream.
        </motion.p>

        {/* Interactive hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.5 }}
          className="mt-6 flex flex-wrap items-center gap-4 text-xs tracking-wider uppercase text-emerald-400/70 font-sans"
        >
          <span className="flex items-center space-x-1.5">
            <span className="text-amber-300">✦</span>
            <span>Click scene to burst fireflies</span>
          </span>
          <span className="hidden sm:inline text-emerald-700">•</span>
          <span className="flex items-center space-x-1.5">
            <span className="text-amber-300">✦</span>
            <span>Hover foliage to shimmer</span>
          </span>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 1.3 }}
        className="flex items-center justify-between text-xs tracking-[0.25em] uppercase text-emerald-300/70 font-sans"
      >
        <div className="flex items-center space-x-3">
          <div className="relative w-5 h-9 rounded-full border border-amber-300/40 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]"
            />
          </div>
          <span className="font-serif italic normal-case text-amber-200/90 text-sm">
            Scroll to push deeper into the forest
          </span>
        </div>

        <div className="hidden sm:block text-emerald-500/60 text-[11px]">
          [01 / 04] PRIMORDIAL CANOPY
        </div>
      </motion.div>
    </section>
  );
}
