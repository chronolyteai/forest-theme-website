'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LiquidLink } from './LiquidLink';

export function AboutSection() {
  const scrollToNext = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: 0.66 * scrollHeight,
      behavior: 'smooth',
    });
  };

  const architecturalSpecs = [
    { value: '320+', label: 'Instanced Ancient Redwoods', desc: 'Individually lit with wind sway shaders' },
    { value: '1024', label: 'Reflection Resolution', desc: 'MeshReflector stream with scrolling ripples' },
    { value: '3,200', label: 'GPU Particles with Curl Noise', desc: 'Organic spring scatter & gather' },
    { value: '7-Pass', label: 'Post-Processing Stack', desc: 'Bloom, bokeh DOF, LUT color grading, SMAA' },
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 sm:px-14 py-24 select-none pointer-events-none">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pointer-events-auto">
        {/* Left Column: Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 relative p-8 sm:p-12 rounded-2xl bg-[#0a1f1a]/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Eyebrow */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="w-8 h-[1px] bg-[#c9a961]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c9a961] font-sans font-medium">
              Chapter 02 // The Living Stream
            </span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-4xl sm:text-6xl text-[#e8dcc4] font-extralight tracking-tight leading-tight mb-6">
            Where the River <br />
            <span className="italic text-[#ffb347]">Reflects the Infinite</span>
          </h2>

          {/* Body */}
          <p className="text-[#e8dcc4]/90 font-sans tracking-wide leading-relaxed text-base sm:text-lg mb-6">
            Skimming low over the winding riverbed, real-time reflections distort through
            animated wave normals. High above, dense redwood foliage occludes the sky,
            channeling 16 volumetric sun shafts through the morning fog.
          </p>

          <blockquote className="border-l border-[#c9a961] pl-5 py-1 italic font-serif text-xl sm:text-2xl font-light text-[#c9a961] mb-8">
            &ldquo;The forest does not sleep; it dreams in chlorophyll, speaks in wind
            harmonics, and remembers every step in the water.&rdquo;
          </blockquote>

          {/* Liquid Link CTA */}
          <LiquidLink onClick={scrollToNext}>
            Ascend to Canopy Echoes →
          </LiquidLink>
        </motion.div>

        {/* Right Column: Technical Specs */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {architecturalSpecs.map((spec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[#c9a961]/40 transition-colors"
            >
              <div className="font-serif text-3xl sm:text-4xl font-extralight text-[#ffb347]">
                {spec.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-[#c9a961] font-sans font-medium">
                {spec.label}
              </div>
              <div className="mt-1 text-xs text-[#e8dcc4]/70 font-sans tracking-wide">
                {spec.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
