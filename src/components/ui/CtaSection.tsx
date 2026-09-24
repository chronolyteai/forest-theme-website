'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

export function CtaSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', vision: '' });
  const triggerBurst = useForestStore((s) => s.triggerBurst);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    triggerBurst(0, 4, -10);
    forestAudio.playBurstChime();
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
      setFormData({ name: '', email: '', vision: '' });
    }, 2800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative w-full min-h-screen flex flex-col justify-between px-6 sm:px-12 py-24 select-none pointer-events-none">
        {/* Top spacer */}
        <div className="h-6" />

        {/* Center Climax: "Let's Build Your World" */}
        <div className="my-auto max-w-4xl mx-auto text-center pointer-events-auto">
          {/* Glowing Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full border border-amber-400/40 bg-emerald-950/60 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs uppercase tracking-[0.3em] text-amber-200 font-sans font-medium">
              Chapter 04 • Twilight Synthesis
            </span>
          </motion.div>

          {/* Pulsing Climax Title */}
          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light tracking-tight text-white leading-tight mb-8"
          >
            Let&apos;s Build <br />
            <span className="italic font-normal bg-gradient-to-r from-amber-200 via-amber-300 to-emerald-200 bg-clip-text text-transparent animate-pulse-slow">
              Your World.
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="max-w-xl mx-auto text-base sm:text-lg text-emerald-100/80 font-sans font-light leading-relaxed mb-10"
          >
            From bespoke WebGL experiences to cinematic brand storytelling, we craft
            digital sanctuaries that captivate, inspire, and endure.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary Glowing Button */}
            <button
              onClick={() => {
                setIsModalOpen(true);
                forestAudio.playBurstChime();
              }}
              className="group relative px-9 py-4 rounded-full overflow-hidden border border-amber-300/70 bg-gradient-to-r from-amber-500/25 via-emerald-600/25 to-amber-500/25 backdrop-blur-md text-amber-100 font-serif text-xl tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 hover:shadow-[0_0_45px_rgba(245,158,11,0.55)]"
            >
              <span className="relative z-10 flex items-center space-x-3">
                <span>START A PROJECT</span>
                <span className="text-amber-300 transition-transform group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {/* Back to Canopy Summit */}
            <button
              onClick={scrollToTop}
              className="px-7 py-4 rounded-full border border-emerald-800/60 bg-emerald-950/40 backdrop-blur-md text-emerald-200 text-xs tracking-widest uppercase font-sans hover:bg-emerald-900/50 hover:border-emerald-600 transition-all duration-300"
            >
              Return to Summit ↑
            </button>
          </motion.div>
        </div>

        {/* Footer info */}
        <footer className="pt-12 border-t border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-emerald-400/60 tracking-wider pointer-events-auto">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <span className="text-amber-300 font-serif text-sm">SYLVANE SANCTUARY</span>
            <span>•</span>
            <span>CRAFTED FOR AWWWARDS SITE OF THE YEAR</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-widest text-emerald-300/70">
            <span>Next.js 14</span>
            <span>Three.js + R3F</span>
            <span>Procedural Shaders</span>
            <span>Web Audio API</span>
          </div>
        </footer>
      </section>

      {/* Interactive Project Inquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg p-8 sm:p-10 rounded-2xl bg-[#051912] border border-amber-300/40 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-emerald-400 hover:text-amber-200 transition-colors text-lg"
                aria-label="Close modal"
              >
                ✕
              </button>

              {submitted ? (
                <div className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-emerald-900/60 border border-amber-300/60 mx-auto flex items-center justify-center mb-6 text-amber-300 text-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                  >
                    ✓
                  </motion.div>
                  <h3 className="font-serif text-3xl text-white mb-2 font-light">
                    Your Beacon Has Been Received
                  </h3>
                  <p className="text-emerald-200/80 font-sans text-sm">
                    The forest whispers back. Our architects will contact you shortly.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-sans mb-2 font-medium">
                    Initiate Collaboration
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl text-white font-light tracking-tight mb-2">
                    Let&apos;s Shape the Digital Wild
                  </h3>
                  <p className="text-emerald-200/70 text-sm font-sans mb-6">
                    Tell us about your brand vision, 3D experience, or creative realm.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-emerald-300/80 font-sans mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Aurelia Vance"
                        className="w-full px-4 py-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-white placeholder-emerald-700/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-emerald-300/80 font-sans mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="aurelia@domain.com"
                        className="w-full px-4 py-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-white placeholder-emerald-700/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-emerald-300/80 font-sans mb-1.5">
                        Vision & Timeline
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.vision}
                        onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                        placeholder="We are launching an immersive 3D flagship for our upcoming collection…"
                        className="w-full px-4 py-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-white placeholder-emerald-700/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-sans font-medium text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
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
