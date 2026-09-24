'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

/**
 * Navbar:
 * - Hidden by default at page summit
 * - Slides in smoothly on scroll-up
 * - Glassmorphism: backdrop-blur-xl, bg-white/5, border-b border-white/10
 * - Minimal audio mute toggle at top-right
 */
export function Navbar() {
  const isMuted = useForestStore((s) => s.isMuted);
  const toggleMute = useForestStore((s) => s.toggleMute);
  const currentSection = useForestStore((s) => s.currentSection);

  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      // Hidden by default at summit
      if (currentY < 120) {
        setIsVisible(false);
      } else if (currentY < lastScrollY.current - 5) {
        // Scrolling up -> slide in
        setIsVisible(true);
      } else if (currentY > lastScrollY.current + 10) {
        // Scrolling down -> hide
        setIsVisible(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const chapters = [
    { label: '01 // Sanctuary', idx: 0 },
    { label: '02 // The Stream', idx: 1 },
    { label: '03 // Canopy Glade', idx: 2 },
    { label: '04 // Twilight Dusk', idx: 3 },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-out pointer-events-none ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="w-full backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => scrollToSection(0)}
          className="pointer-events-auto flex items-center space-x-3 cursor-pointer group"
        >
          <span className="font-serif text-2xl font-light tracking-[0.25em] text-[#e8dcc4] group-hover:text-[#ffb347] transition-colors">
            SYLVANE
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.3em] text-[#2d5a4a] font-sans font-medium">
            Primeval Biome
          </span>
        </div>

        {/* Chapters */}
        <nav className="pointer-events-auto hidden md:flex items-center space-x-8 text-xs font-sans tracking-[0.2em] uppercase">
          {chapters.map((ch) => (
            <button
              key={ch.idx}
              onClick={() => scrollToSection(ch.idx)}
              className={`transition-colors duration-300 ${
                currentSection === ch.idx
                  ? 'text-[#ffb347] font-medium'
                  : 'text-[#e8dcc4]/70 hover:text-[#e8dcc4]'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </nav>

        {/* Minimal Audio Mute Toggle */}
        <div className="pointer-events-auto flex items-center space-x-4">
          <button
            onClick={handleAudioToggle}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:border-[#c9a961]/60 text-[#e8dcc4] hover:text-[#ffb347] transition-all duration-300"
            title={isMuted ? 'Unmute Ambient Soundscape' : 'Mute Sound'}
            aria-label="Soundscape toggle"
          >
            {/* Minimal speaker icon */}
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {!isMuted && (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              )}
              {isMuted && <line x1="23" y1="9" x2="17" y2="15" />}
            </svg>
            <span className="text-[10px] uppercase tracking-widest font-sans font-medium">
              {isMuted ? 'Muted' : 'Sound'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
