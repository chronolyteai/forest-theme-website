'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LiquidLinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
}

/**
 * LiquidLink:
 * Replaces generic buttons with editorial-grade underlined text
 * that triggers an animated SVG liquid wave morph on hover.
 */
export function LiquidLink({ children, onClick, className = '' }: LiquidLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  // SVG paths: resting flat line vs morphed turbulent liquid wave
  const flatPath = 'M 0 4 Q 100 4 200 4 T 400 4';
  const liquidPath = 'M 0 4 Q 100 -4 200 7 T 400 3';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative inline-flex flex-col items-start cursor-pointer focus:outline-none select-none ${className}`}
    >
      <span className="font-serif text-xl sm:text-2xl font-extralight tracking-widest text-[#e8dcc4] group-hover:text-[#ffb347] transition-colors duration-300">
        {children}
      </span>

      {/* Animated Liquid SVG Underline Morph */}
      <svg
        viewBox="0 0 400 12"
        className="w-full h-2.5 mt-1 overflow-visible pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={isHovered ? liquidPath : flatPath}
          stroke="#c9a961"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{
            d: isHovered ? [liquidPath, 'M 0 4 Q 100 8 200 -2 T 400 4', liquidPath] : flatPath,
            stroke: isHovered ? '#ffb347' : '#c9a961',
          }}
          transition={{
            duration: 1.2,
            repeat: isHovered ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </button>
  );
}
