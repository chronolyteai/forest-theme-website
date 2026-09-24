'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AboutSection() {
  const stats = [
    { value: '940+', label: 'Year Old Redwoods', desc: 'Ancient root network' },
    { value: '100%', label: 'Procedural Flora', desc: 'Wind sway shader trees' },
    { value: '3.2k', label: 'Bioluminescent Spores', desc: 'Reactive to cursor' },
    { value: '60fps', label: 'Real-Time Reflection', desc: 'MeshReflector stream' },
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 sm:px-12 py-24 select-none pointer-events-none">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-auto">
        {/* Left Column: Glassmorphism Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 relative p-8 sm:p-10 rounded-2xl bg-[#041610]/70 backdrop-blur-xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Subtle water reflection gradient highlight at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-teal-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

          {/* Section Indicator */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="w-8 h-[1px] bg-amber-400" />
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-sans font-medium">
              Chapter 02 • The Living Stream
            </span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-light tracking-tight leading-tight mb-6">
            Where the River <br />
            <span className="italic bg-gradient-to-r from-amber-200 via-amber-300 to-emerald-300 bg-clip-text text-transparent">
              Mirrors Eternity
            </span>
          </h2>

          {/* Narrative text */}
          <p className="text-emerald-100/80 font-sans font-light text-base sm:text-lg leading-relaxed mb-6">
            As the camera glides down low over the flowing mountain stream, real-time
            reflections capture towering ancient trunks, volumetric light beams, and
            the celestial spirit stag standing serenely in the cool current.
          </p>

          <p className="text-emerald-200/70 font-sans font-light text-sm sm:text-base leading-relaxed mb-8">
            Every blade of fern, every falling leaf, and every water ripple is
            synthesized through mathematical noise shaders—breathing synchronously with
            the forest soundscape.
          </p>

          {/* Quote */}
          <blockquote className="border-l-2 border-amber-400/60 pl-4 py-1 italic font-serif text-lg text-amber-200/90">
            &ldquo;The forest does not sleep; it dreams in chlorophyll, speaks in wind
            harmonics, and remembers every step in the water.&rdquo;
          </blockquote>
        </motion.div>

        {/* Right Column: Architectural Forest Metrics */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: idx * 0.12 }}
              className="p-5 rounded-xl bg-[#041610]/60 backdrop-blur-md border border-emerald-900/40 hover:border-amber-400/40 transition-colors group"
            >
              <div className="font-serif text-3xl sm:text-4xl font-light text-amber-200 group-hover:text-amber-300 transition-colors">
                {item.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-emerald-300 font-sans font-medium">
                {item.label}
              </div>
              <div className="mt-1 text-[11px] text-emerald-500/80 font-sans">
                {item.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
