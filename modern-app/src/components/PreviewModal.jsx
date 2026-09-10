import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download, Copy, Check, Info } from 'lucide-react';
import {
  EASINGS,
  interactiveHover,
  interactiveTap,
} from '../constants/motionConfig';
import { getAssetUrl } from '../utils/assetUrl';

export default function PreviewModal({ card, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!card) return null;

  const currentYear = new Date().getFullYear();
  const citationText = `Andrew, R. ${currentYear}: "${card.title}", CICERO Center for International Climate Research, available at: ${card.url}`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASINGS.gentleDeceleration }}
          onClick={onClose}
          className="fixed inset-0 bg-[#11181c]/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.35, ease: EASINGS.materialEntrance }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#ffffff] rounded-[12px] border border-[#e6e8eb] soft-card-shadow overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#f0f1f3] flex items-center justify-between bg-[#f8f9fa]">
            <div>
              <span className="text-xs font-semibold text-[#0066FF] uppercase tracking-wider">
                {card.category}
              </span>
              <h2 className="text-lg font-bold text-[#11181c] mt-0.5">
                {card.title}
              </h2>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="p-1.5 rounded-[8px] text-[#687076] hover:text-[#11181c] hover:bg-[#ffffff] border border-transparent hover:border-[#e6e8eb] transition-colors cursor-pointer"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Visual Preview */}
            <div className="w-full bg-[#f8f9fa] rounded-[8px] border border-[#f0f1f3] p-4 flex items-center justify-center overflow-hidden">
              <img
                src={getAssetUrl(card.image)}
                alt={card.title}
                className="max-h-[360px] w-auto object-contain rounded-[6px]"
              />
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-[#687076] uppercase tracking-wider mb-2">
                Overview
              </h4>
              <p className="text-sm text-[#11181c] leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Scientific Citation Helper */}
            <div className="p-4 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#11181c]">
                  <Info size={14} className="text-[#0066FF]" />
                  <span>Suggested Scientific Citation (CC-BY 4.0)</span>
                </div>
                <motion.button
                  onClick={handleCopyCitation}
                  whileHover={interactiveHover}
                  whileTap={interactiveTap}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-[6px] bg-[#ffffff] border border-[#e6e8eb] text-[#11181c] hover:border-[#0066FF] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-[#687076]" />
                      <span>Copy citation</span>
                    </>
                  )}
                </motion.button>
              </div>
              <p className="text-xs font-mono text-[#687076] select-all bg-[#ffffff] p-2.5 rounded-[6px] border border-[#f0f1f3]">
                {citationText}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#f8f9fa] border-t border-[#f0f1f3] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#687076]">
              All data released under CC-BY 4.0 license
            </span>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={onClose}
                whileHover={interactiveHover}
                whileTap={interactiveTap}
                className="px-4 py-2 text-xs font-medium text-[#687076] hover:text-[#11181c] rounded-[8px] transition-colors cursor-pointer"
              >
                Close
              </motion.button>
              <motion.a
                href={card.localRoute || card.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={interactiveHover}
                whileTap={interactiveTap}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0066FF] text-[#ffffff] rounded-[8px] hover:bg-[#0052cc] transition-colors shadow-xs"
              >
                <span>Open dedicated page</span>
                <ExternalLink size={13} />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
