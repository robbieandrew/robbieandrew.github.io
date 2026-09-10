import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Check, Maximize2, ExternalLink, FileText } from 'lucide-react';
import {
  EASINGS,
  VIEWPORT_CONFIG,
  interactiveHover,
  interactiveTap,
} from '../constants/motionConfig';
import { getAssetUrl } from '../utils/assetUrl';

export default function ChartViewer({
  src,
  title,
  subtitle,
  dataPath,
  aspectRatio = '16/10',
  notes,
}) {
  const [copied, setCopied] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

  const resolvedSrc = getAssetUrl(src);
  const resolvedDataPath = dataPath ? getAssetUrl(dataPath) : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTitle = (text) => {
    if (!text) return null;
    if (text.includes('CO2')) {
      const parts = text.split('CO2');
      return (
        <>
          {parts[0]}
          CO<span className="subb">2</span>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  const isVideo = src && (src.endsWith('.mp4') || src.endsWith('.webm'));

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.45, ease: EASINGS.materialEntrance },
          },
        }}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT_CONFIG}
        className="flex flex-col rounded-[12px] bg-[#f8f9fa] border border-[#f0f1f3] soft-card-shadow overflow-hidden"
      >
        {/* Chart Header */}
        <div className="px-4 py-3 border-b border-[#f0f1f3] flex items-center justify-between bg-[#ffffff]">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#11181c] leading-tight">
              {renderTitle(title)}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-[#687076] mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => setEnlarged(true)}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              title={isVideo ? "Enlarge video" : "Enlarge figure"}
              className="p-1.5 rounded-[6px] text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa] cursor-pointer"
            >
              <Maximize2 size={13} />
            </motion.button>
            <motion.button
              onClick={handleCopyLink}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              title="Copy graphic link"
              className="p-1.5 rounded-[6px] text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa] cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </motion.button>
            <motion.a
              href={resolvedSrc}
              download
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              title={isVideo ? "Download video" : "Download vector graphic"}
              className="p-1.5 rounded-[6px] text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa]"
            >
              <Download size={13} />
            </motion.a>
          </div>
        </div>

        {/* Chart Display Area */}
        <div
          className="relative w-full bg-[#ffffff] p-2 flex items-center justify-center overflow-hidden"
          style={{ aspectRatio }}
        >
          {isVideo ? (
            <video
              src={resolvedSrc}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={resolvedSrc}
              alt={title}
              loading="lazy"
              className="w-full h-full object-contain select-none"
            />
          )}
        </div>

        {/* Footer info & Data download */}
        <div className="px-4 py-2.5 bg-[#f8f9fa] border-t border-[#f0f1f3] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-[#687076]">{notes || 'Source: CICERO / Robbie Andrew'}</span>
          {resolvedDataPath && (
            <motion.a
              href={resolvedDataPath}
              download
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0066FF] hover:underline"
            >
              <FileText size={11} />
              <span>Download CSV</span>
            </motion.a>
          )}
        </div>
      </motion.div>

      {/* Enlarge Lightbox Modal */}
      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11181c]/70 backdrop-blur-xs"
          onClick={() => setEnlarged(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASINGS.materialEntrance }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#ffffff] rounded-[12px] p-4 flex flex-col soft-card-shadow overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f1f3]">
              <h3 className="text-sm font-semibold text-[#11181c]">{renderTitle(title)}</h3>
              <button
                onClick={() => setEnlarged(false)}
                className="text-xs px-3 py-1 rounded-[6px] bg-[#f8f9fa] hover:bg-[#e6e8eb] text-[#11181c] cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
              {isVideo ? (
                <video
                  src={resolvedSrc}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[75vh] object-contain rounded-[6px]"
                />
              ) : (
                <img
                  src={resolvedSrc}
                  alt={title}
                  className="w-full max-h-[75vh] object-contain select-none"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
