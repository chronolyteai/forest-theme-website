'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function FeaturesSection() {
  const features = [
    {
      number: '01',
      title: 'Volumetric God Rays',
      tag: 'Optics & Shaders',
      description:
        'Golden-hour sunbeams pierce through the dense redwood canopy, animated with 3D Simplex noise to simulate drifting forest dust and atmospheric haze.',
    },
    {
      number: '02',
      title: 'Celestial Spirit Stag',
      tag: 'Bio-Luminescent Fauna',
      description:
        'An ancient guardian deer with glowing crystalline antlers and concentric ethereal energy rings that pulse to the beat of procedural ambient music.',
    },
    {
      number: '03',
      title: 'Real-Time Reflective Stream',
      tag: 'MeshReflector Material',
      description:
        'A winding mountain river reflecting the ancient trees and glowing spirits, deformed dynamically by procedural water wave normals.',
    },
    {
      number: '04',
      title: 'Wind-Sway Foliage & Shimmer',
      tag: 'Instanced Mesh Shaders',
      description:
        'Over 140+ instanced redwoods sway gently in the breeze. Hovering your cursor over the canopy triggers a glistening wave of golden-emerald shimmer.',
    },
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center px-6 sm:px-12 py-24 select-none pointer-events-none">
      <div className="max-w-6xl w-full mx-auto pointer-events-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.9 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-amber-400/30 bg-emerald-950/50 backdrop-blur-md mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-200 font-sans">
              Constellation Alignment
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-light tracking-tight mb-4">
            Echoes of the Canopy
          </h2>

          <p className="text-emerald-100/75 font-sans font-light text-sm sm:text-base leading-relaxed">
            In this sacred glade, thousands of fireflies converge to form celestial
            constellations. Hover, explore, and witness the technological craft powering
            this living digital forest.
          </p>
        </motion.div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: idx * 0.12 }}
              whileHover={{ y: -4, borderColor: 'rgba(253, 211, 77, 0.45)' }}
              className="group relative p-7 sm:p-8 rounded-2xl bg-[#041610]/60 backdrop-blur-xl border border-emerald-900/40 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Background amber hover sheen */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-[40px] group-hover:bg-amber-400/20 transition-all duration-500 pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between mb-4">
                <span className="font-mono text-xs tracking-widest text-amber-400/80 font-semibold">
                  FEATURE // {feat.number}
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-800/60 bg-emerald-950/60 text-emerald-300">
                  {feat.tag}
                </span>
              </div>

              <h3 className="relative z-10 font-serif text-2xl sm:text-3xl font-light text-amber-100 group-hover:text-amber-200 transition-colors mb-3">
                {feat.title}
              </h3>

              <p className="relative z-10 text-emerald-200/70 font-sans font-light text-sm sm:text-base leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
