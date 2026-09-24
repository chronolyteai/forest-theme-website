'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LiquidLink } from './LiquidLink';

export function FeaturesSection() {
  const scrollToNext = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: scrollHeight,
      behavior: 'smooth',
    });
  };

  const systems = [
    {
      num: '01',
      title: 'Volumetric Raymarching',
      desc: 'Raymarched 3D fog volume with Simplex noise animated along Y and time. Blends deep shadow (#0a1f1a) to mid (#2d5a4a) to near light (#c9a961).',
      tag: 'Full-Volume Shader',
    },
    {
      num: '02',
      title: 'Curl Noise GPU Particles',
      desc: '3,200 fireflies floating along divergence-free curl vectors (#d4ff7a to #ffb347). Scatter within 2.0 units of cursor with spring restorative physics.',
      tag: 'Hero Particle System',
    },
    {
      num: '03',
      title: 'Particle Spirit Deer',
      desc: 'Parametric point-cloud stag breathing on a 4.0-second sine cycle (#7fffcf to #ffffff core). Swirls and reforms when your cursor draws near.',
      tag: 'Procedural Fauna',
    },
    {
      num: '04',
      title: 'MeshReflector Waterway',
      desc: 'Shallow reflective stream with roughness 0.05, 1024 resolution, scrolling ripple normal map, soft shoreline foam, and underwater caustics.',
      tag: 'Screen-Space Optics',
    },
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center px-6 sm:px-14 py-24 select-none pointer-events-none">
      <div className="max-w-6xl w-full mx-auto pointer-events-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-12"
        >
          <div className="text-xs uppercase tracking-[0.25em] text-[#c9a961] font-sans font-medium mb-3">
            Chapter 03 // Canopy Glade
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl text-[#e8dcc4] font-extralight tracking-tight leading-tight mb-4">
            Echoes of the Canopy
          </h2>
          <p className="text-[#e8dcc4]/90 font-sans tracking-wide leading-relaxed text-base sm:text-lg">
            Every volumetric light beam, rustling leaf, and bioluminescent spore is
            calculated in real-time GLSL, creating an organic ecosystem that breathes in unison.
          </p>
        </motion.div>

        {/* 4 Feature Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {systems.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-7 sm:p-8 rounded-2xl bg-[#0a1f1a]/75 backdrop-blur-xl border border-white/10 hover:border-[#c9a961]/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="font-mono text-xs text-[#ffb347] font-semibold tracking-widest">
                  SYS // {s.num}
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#2d5a4a] text-[#7fffcf] bg-white/[0.02]">
                  {s.tag}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#e8dcc4] mb-3">
                {s.title}
              </h3>
              <p className="text-[#e8dcc4]/80 font-sans tracking-wide text-sm leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Liquid Link CTA */}
        <div>
          <LiquidLink onClick={scrollToNext}>
            Proceed to the Twilight Summit →
          </LiquidLink>
        </div>
      </div>
    </section>
  );
}
