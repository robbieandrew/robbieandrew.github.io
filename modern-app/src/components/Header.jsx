import React from 'react';
import { motion } from 'framer-motion';
import { EASINGS, interactiveHover, interactiveTap } from '../constants/motionConfig';
import { ExternalLink, Radio } from 'lucide-react';

export default function Header({ onOpenUpdates }) {
  return (
    <header className="relative w-full border-b border-[#f0f1f3] bg-[#ffffff] noise-subtle">
      {/* Top Utility Bar */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex flex-wrap items-center justify-between gap-4 text-xs text-[#687076]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
          <span className="font-medium text-[#11181c]">Research Portal</span>
          <span>•</span>
          <span>Updated September 2026</span>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          <motion.a
            href="/"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="hover:text-[#11181c] font-medium transition-colors"
          >
            Home
          </motion.a>
          <motion.a
            href="https://folk.uio.no/roberan"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="hover:text-[#11181c] transition-colors inline-flex items-center gap-1"
          >
            Old website
            <ExternalLink size={11} className="text-[#687076]" />
          </motion.a>
          <motion.a
            href="https://www.cicero.oslo.no/en"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="hover:text-[#11181c] transition-colors inline-flex items-center gap-1"
          >
            CICERO
            <ExternalLink size={11} className="text-[#687076]" />
          </motion.a>
          <motion.a
            href="https://forms.gle/jeuyvoeXqBQMnsGX8"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="hover:text-[#11181c] transition-colors"
          >
            Contact me
          </motion.a>
          {onOpenUpdates && (
            <motion.button
              onClick={onOpenUpdates}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="text-[#0066FF] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Radio size={12} />
              Changelog
            </motion.button>
          )}
        </nav>
      </div>

      {/* Main Author & Institution Hero */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASINGS.materialEntrance }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#11181c]"
        >
          Robbie Andrew
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASINGS.materialEntrance }}
          className="mt-2 text-sm sm:text-base text-[#687076] max-w-2xl mx-auto"
        >
          CICERO Center for International Climate Research, Oslo, Norway
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.16, ease: EASINGS.subtleOvershoot }}
          className="mt-4 flex items-center justify-center gap-2"
        >
          <motion.a
            href="https://bsky.app/profile/robbieandrew.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-xs font-medium text-[#11181c] hover:border-[#0066FF]/30 transition-colors"
          >
            <span>Active on</span>
            <span className="text-[#0066FF] font-semibold">BlueSky</span>
            <img
              src="/img/BlueSky.svg"
              alt="BlueSky"
              className="w-4 h-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.a>
        </motion.div>
      </div>
    </header>
  );
}
