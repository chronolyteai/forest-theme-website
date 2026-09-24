'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

export function Navbar() {
  const isMuted = useForestStore((s) => s.isMuted);
  const toggleMute = useForestStore((s) => s.toggleMute);
  const currentSection = useForestStore((s) => s.currentSection);
  const audioEnergy = useForestStore((s) => s.audioEnergy);
  const scrollProgress = useForestStore((s) => s.scrollProgress);

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    setHasScrolled(scrollProgress > 0.05);
  }, [scrollProgress]);

  const handleAudioToggle = () => {
    toggleMute();
    if (isMuted) {
      forestAudio.start();
    } else {
      forestAudio.stop();
    }
  };

  const scrollToSection = (index: number) => {
    const targets = [0, 0.33, 0.66, 1.0];
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: targets[index] * scrollHeight,
      behavior: 'smooth',
    });
  };

  const navLinks = [
    { label: '01. Sanctuary', index: 0 },
    { label: '02. Living Stream', index: 1 },
    { label: '03. Canopy Echoes', index: 2 },
    { label: '04. Twilight World', index: 3 },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 pointer-events-none ${
        hasScrolled
          ? 'py-3 bg-[#030d08]/75 backdrop-blur-md border-b border-emerald-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'py-6 bg-gradient-to-b from-[#030d08]/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo & Rune Mark */}
        <div
          onClick={() => scrollToSection(0)}
          className="pointer-events-auto flex items-center space-x-3 cursor-pointer group"
        >
          {/* Sacred Leaf/Rune Emblem */}
          <div className="relative w-8 h-8 rounded-full border border-amber-300/40 bg-emerald-950/60 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.35)]">
            <svg
              className="w-4 h-4 text-amber-300 transition-transform duration-500 group-hover:rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12c0 6.5 8 10 10 10s10-3.5 10-10C22 6.5 17.5 2 12 2z" />
              <path d="M12 6v12" />
              <path d="M12 9c2-1 4-1 6 0" />
              <path d="M12 15c-2 1-4 1-6 0" />
            </svg>
          </div>

          <div>
            <span className="font-serif text-xl sm:text-2xl tracking-[0.2em] font-medium text-amber-100 group-hover:text-amber-200 transition-colors">
              SYLVANE
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] tracking-[0.3em] uppercase text-emerald-400/80 font-sans">
              Sanctuary
            </span>
          </div>
        </div>

        {/* Center Chapter Indicators (Desktop) */}
        <nav className="pointer-events-auto hidden md:flex items-center space-x-7 text-xs font-sans tracking-[0.18em] uppercase">
          {navLinks.map((item) => {
            const isActive = currentSection === item.index;
            return (
              <button
                key={item.index}
                onClick={() => scrollToSection(item.index)}
                className={`transition-all duration-300 relative py-1 ${
                  isActive
                    ? 'text-amber-300 font-medium'
                    : 'text-emerald-100/60 hover:text-emerald-100'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(253,211,77,0.8)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Audio Toggle & CTA */}
        <div className="pointer-events-auto flex items-center space-x-4">
          {/* Ambient Soundscape Toggle */}
          <button
            onClick={handleAudioToggle}
            className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-950/50 backdrop-blur-sm text-emerald-200/90 hover:text-amber-200 hover:border-amber-400/60 transition-all duration-300 group shadow-[0_0_12px_rgba(0,0,0,0.3)]"
            title={isMuted ? 'Play Ambient Soundscape' : 'Mute Audio'}
            aria-label="Soundscape toggle"
          >
            {/* Equalizer animation bars */}
            <div className="flex items-end space-x-[2px] h-3.5 w-4">
              {[0.4, 0.9, 0.6, 0.3].map((heightScale, i) => (
                <motion.span
                  key={i}
                  className={`w-[2.5px] rounded-full transition-colors ${
                    isMuted
                      ? 'bg-emerald-700/60 h-[2px]'
                      : 'bg-amber-300 group-hover:bg-amber-200'
                  }`}
                  animate={
                    isMuted
                      ? { height: 2 }
                      : {
                          height: [
                            `${3 + heightScale * 3}px`,
                            `${Math.max(4, 14 * audioEnergy * heightScale)}px`,
                            `${3 + heightScale * 3}px`,
                          ],
                        }
                  }
                  transition={{
                    duration: 0.8 + i * 0.2,
                    repeat: isMuted ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <span className="text-[11px] uppercase tracking-widest font-sans font-medium">
              {isMuted ? 'Sound Off' : 'Sound On'}
            </span>
          </button>

          {/* Quick Experience CTA */}
          <button
            onClick={() => scrollToSection(3)}
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-emerald-500/15 text-amber-200 text-xs tracking-widest uppercase font-sans hover:bg-amber-500/25 hover:border-amber-300 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            Explore
          </button>
        </div>
      </div>
    </header>
  );
}
