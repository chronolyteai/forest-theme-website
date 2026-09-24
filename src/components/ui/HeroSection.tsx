'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LiquidLink } from './LiquidLink';

/**
 * HeroSection:
 * - Cormorant Garamond (200 weight, huge)
 * - Hero title: 12vw, letter-spacing -0.03em, staggered per-letter reveal:
 *     opacity 0->1, y 40->0, blur 8->0, 0.06s stagger, custom cubic-bezier [0.16, 1, 0.3, 1]
 * - Inter body, tracking-wide, 90% opacity
 * - Underlined CTA with animated liquid hover morph
 */
export function HeroSection() {
  const titleText = 'ENTER THE WILD';

  const scrollToNext = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: 0.33 * scrollHeight,
      behavior: 'smooth',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06, // MANDATED 0.06s stagger
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1], // MANDATED custom cubic-bezier
      },
    },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between px-6 sm:px-14 py-24 select-none pointer-events-none">
      {/* Top Header Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between text-xs tracking-[0.25em] uppercase text-[#c9a961] font-sans font-medium mt-2"
      >
        <div className="flex items-center space-x-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb347] animate-ping" />
          <span>Sanctuary // Sector 01</span>
        </div>
        <div className="hidden sm:block font-mono text-[11px] text-[#e8dcc4]/60">
          64°08&apos;N 19°42&apos;W • PRIMORDIAL CANOPY
        </div>
      </motion.div>

      {/* Massive 12vw Editorial Title */}
      <div className="my-auto max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-serif font-extralight tracking-[-0.03em] leading-none text-[#e8dcc4]"
          style={{ fontSize: 'clamp(3.8rem, 12vw, 13rem)' }}
        >
          {titleText.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className={`inline-block ${char === ' ' ? 'mr-4 sm:mr-8' : ''}`}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Narrative Inter body: tracking-wide, 90% opacity */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-10 max-w-xl text-base sm:text-lg text-[#e8dcc4]/90 font-sans tracking-wide leading-relaxed"
        >
          An ancient sanctuary where volumetric amber sunbeams pierce 300-year redwoods,
          and a celestial spirit stag walks the reflective mountain stream.
        </motion.p>

        {/* Underlined Liquid Hover CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-10 pointer-events-auto"
        >
          <LiquidLink onClick={scrollToNext}>
            Descend to the Living Stream →
          </LiquidLink>
        </motion.div>
      </div>

      {/* Bottom Guidance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.5 }}
        className="flex items-center justify-between text-xs tracking-[0.2em] uppercase text-[#e8dcc4]/70 font-sans"
      >
        <span className="font-serif italic normal-case text-sm text-[#c9a961]">
          Scroll to fly through the ancient biome
        </span>
        <span className="hidden sm:inline font-mono text-[11px] text-[#2d5a4a]">
          UE5 FIDELITY • REAL-TIME VOLUMETRICS
        </span>
      </motion.div>
    </section>
  );
}
