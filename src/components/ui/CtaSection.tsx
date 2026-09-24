'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidLink } from './LiquidLink';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

export function CtaSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const triggerBurst = useForestStore((s) => s.triggerBurst);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    triggerBurst(0, 4, -12);
    forestAudio.playBurstChime();
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 2800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative w-full min-h-screen flex flex-col justify-between px-6 sm:px-14 py-24 select-none pointer-events-none">
        <div className="h-4" />

        {/* Center Climax */}
        <div className="my-auto max-w-4xl mx-auto text-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.3em] text-[#c9a961] font-sans font-medium mb-6"
          >
            Chapter 04 // Twilight Horizon
          </motion.div>

          {/* Mandated Climax Title */}
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extralight tracking-tight text-[#e8dcc4] leading-tight mb-8"
          >
            Let&apos;s Build <br />
            <span className="italic font-light text-[#ffb347] animate-pulse">
              Your World.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl mx-auto text-base sm:text-lg text-[#e8dcc4]/90 font-sans tracking-wide leading-relaxed mb-12"
          >
            We sculpt cinematic 3D digital realities, volumetric worlds, and interactive
            stories engineered to leave audiences breathless.
          </motion.p>

          {/* Liquid Link CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-10"
          >
            <LiquidLink onClick={() => setIsModalOpen(true)}>
              Initiate Collaboration →
            </LiquidLink>

            <button
              onClick={scrollToTop}
              className="font-sans text-xs uppercase tracking-[0.25em] text-[#c9a961]/80 hover:text-[#ffb347] transition-colors"
            >
              Return to Summit ↑
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-[#e8dcc4]/60 tracking-wider pointer-events-auto">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <span className="text-[#c9a961] font-serif text-sm">SYLVANE SANCTUARY</span>
            <span>•</span>
            <span>AWWWARDS SOTD CALIBER</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-widest text-[#2d5a4a]">
            <span>Next.js 14</span>
            <span>Three.js + R3F</span>
            <span>Raymarched Volumetric Fog</span>
            <span>Procedural Audio</span>
          </div>
        </footer>
      </section>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.94, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg p-8 sm:p-10 rounded-2xl bg-[#0a1f1a] border border-[#c9a961]/40 shadow-[0_30px_70px_rgba(0,0,0,0.9)] text-[#e8dcc4]"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-[#c9a961] hover:text-[#ffb347] text-lg"
                aria-label="Close"
              >
                ✕
              </button>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full border border-[#c9a961] text-[#ffb347] mx-auto flex items-center justify-center mb-5 text-2xl">
                    ✓
                  </div>
                  <h3 className="font-serif text-3xl font-light text-[#e8dcc4] mb-2">
                    Signal Transmitted
                  </h3>
                  <p className="text-sm font-sans text-[#e8dcc4]/80">
                    The ancient glade echoes back. Our creative architects will reply shortly.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[#c9a961] font-sans font-medium mb-2">
                    Initiate Collaboration
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-extralight text-[#e8dcc4] mb-2">
                    Sculpt Your Digital Wild
                  </h3>
                  <p className="text-sm font-sans tracking-wide text-[#e8dcc4]/80 mb-6">
                    Tell us about your brand vision, 3D experience, or creative realm.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#c9a961] font-sans mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Woods"
                        className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-[#e8dcc4] placeholder-white/30 focus:outline-none focus:border-[#c9a961] font-sans text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#c9a961] font-sans mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@sanctuary.design"
                        className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-[#e8dcc4] placeholder-white/30 focus:outline-none focus:border-[#c9a961] font-sans text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#c9a961] font-sans mb-1.5">
                        Vision & Timeline
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Building an immersive flagship experience for our global product launch…"
                        className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-[#e8dcc4] placeholder-white/30 focus:outline-none focus:border-[#c9a961] font-sans text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 rounded-lg bg-[#c9a961] hover:bg-[#ffb347] text-[#0a1f1a] font-sans font-medium text-xs uppercase tracking-widest transition-colors duration-300 shadow-[0_0_20px_rgba(201,169,97,0.35)]"
                    >
                      Transmit Signal →
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
