import React from 'react';
import { motion } from 'framer-motion';
import { interactiveHover, interactiveTap } from '../constants/motionConfig';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#f0f1f3] bg-[#f8f9fa] py-12 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        {/* Exact text from original site */}
        <p className="text-sm text-[#687076]">
          My old website with previous work is still available{' '}
          <motion.a
            href="https://folk.uio.no/roberan"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="text-[#0066FF] hover:underline font-medium inline-flex items-center gap-0.5"
          >
            here
            <ExternalLink size={12} />
          </motion.a>
          .
        </p>

        {/* Attribution and licensing info */}
        <div className="pt-4 border-t border-[#e6e8eb] max-w-xl mx-auto text-xs text-[#687076] space-y-1">
          <p>
            Maintained by{' '}
            <strong className="text-[#11181c] font-semibold">Robbie Andrew</strong>, Senior
            Researcher at CICERO Center for International Climate Research, Oslo, Norway.
          </p>
          <p>
            All figures and underlying datasets are provided under a{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066FF] hover:underline"
            >
              CC-BY 4.0 International License
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
