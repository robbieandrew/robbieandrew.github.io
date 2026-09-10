import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  BookOpen,
  ExternalLink,
  Sliders,
  Maximize2,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import gcbByEdition from '../data/gcbFiguresByEdition.json';
import {
  containerStagger,
  interactiveHover,
  interactiveTap,
  EASINGS,
  VIEWPORT_CONFIG,
} from '../constants/motionConfig';
import { getAssetUrl } from '../utils/assetUrl';

const EDITIONS = ['2025', '2024', '2023', '2022', '2021'];

export default function GcbPage() {
  const [edition, setEdition] = useState('2025');
  const [unit, setUnit] = useState('GtCO2'); // 'GtCO2' or 'GtC'
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const figuresForEdition = useMemo(() => {
    return gcbByEdition[edition] || [];
  }, [edition]);

  const filteredFigures = useMemo(() => {
    return figuresForEdition.filter((fig) => {
      if (unit === 'GtC' && fig.includeInGtC === false) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        fig.title?.toLowerCase().includes(q) ||
        fig.baseFilename?.toLowerCase().includes(q) ||
        fig.slideNumber?.includes(q)
      );
    });
  }, [figuresForEdition, unit, searchQuery]);

  const citationText = `Friedlingstein et al. ${edition}: "Global Carbon Budget ${edition}", Earth System Science Data, DOI: 10.18160/GCP-${edition}. Data archive: 10.5281/zenodo.5569234.`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Figures from the Global Carbon Budget {edition}
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          Official visual presentation figures released by the Global Carbon Project (GCP)
          synthesizing global emissions, carbon cycle perturbations, land-use change, ocean and
          terrestrial sinks.
        </p>

        {/* Global Carbon Budget Navigation / Action Links */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.a
            href={`https://doi.org/10.5281/zenodo.5569234`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0066FF] text-[#ffffff] font-medium shadow-xs"
          >
            <span>Download Zenodo Dataset (1750–present)</span>
            <ExternalLink size={12} />
          </motion.a>

          <motion.a
            href={`/GCB${edition}/slides/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#11181c] font-medium"
          >
            <span>Open HTML5 Slide Deck</span>
            <ExternalLink size={12} />
          </motion.a>
        </div>
      </div>

      {/* Citation Box */}
      <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#11181c]">
          <BookOpen size={16} className="text-[#0066FF]" />
          <span>Scientific Documentation: Friedlingstein et al. {edition} (CC-BY 4.0)</span>
        </div>
        <motion.button
          onClick={handleCopyCitation}
          whileHover={interactiveHover}
          whileTap={interactiveTap}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#ffffff] border border-[#e6e8eb] text-[#11181c] hover:border-[#0066FF] cursor-pointer"
        >
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy paper citation'}</span>
        </motion.button>
      </div>

      {/* Control Bar: Edition, Units, Search */}
      <div className="p-6 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Edition Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#687076] uppercase tracking-wider">
              Budget Year:
            </span>
            <div className="flex gap-1">
              {EDITIONS.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setEdition(yr)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-colors cursor-pointer ${
                    edition === yr
                      ? 'bg-[#0066FF] text-[#ffffff]'
                      : 'bg-[#f8f9fa] text-[#687076] hover:text-[#11181c] border border-[#e6e8eb]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Switcher: GtCO2 vs GtC */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#687076] uppercase tracking-wider">
              Units:
            </span>
            <div className="flex rounded-[6px] border border-[#e6e8eb] p-0.5 bg-[#f8f9fa]">
              <button
                onClick={() => setUnit('GtCO2')}
                className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-colors cursor-pointer ${
                  unit === 'GtCO2'
                    ? 'bg-[#ffffff] text-[#11181c] shadow-xs'
                    : 'text-[#687076] hover:text-[#11181c]'
                }`}
              >
                Gt CO<span className="subb">2</span>
              </button>
              <button
                onClick={() => setUnit('GtC')}
                className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-colors cursor-pointer ${
                  unit === 'GtC'
                    ? 'bg-[#ffffff] text-[#11181c] shadow-xs'
                    : 'text-[#687076] hover:text-[#11181c]'
                }`}
              >
                Gt Carbon (GtC)
              </button>
            </div>
          </div>

          {/* Search Filter */}
          <div className="max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search figure titles..."
              className="w-full px-3 py-1.5 text-xs bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c] placeholder-[#687076] focus:outline-none focus:border-[#0066FF]"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[#f0f1f3] text-xs text-[#687076]">
          Showing {filteredFigures.length} figures for Global Carbon Budget {edition} ({unit})
        </div>
      </div>

      {/* Grid of GCB Figures */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredFigures.map((fig, idx) => {
          const slideNum = fig.slideNumber;
          const title = fig.title;
          const imageSrc = getAssetUrl(fig.imageSrc);
          const dataSrc = fig.csv ? getAssetUrl(fig.csv) : null;

          return (
            <motion.div
              key={`${edition}_${idx}_${slideNum}`}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: EASINGS.materialEntrance },
                },
              }}
              whileInView="show"
              initial="hidden"
              viewport={VIEWPORT_CONFIG}
              className="flex flex-col rounded-[12px] bg-[#f8f9fa] border border-[#f0f1f3] soft-card-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-[#f0f1f3] flex items-center justify-between bg-[#ffffff]">
                <div>
                  <span className="text-[11px] font-mono text-[#0066FF] font-semibold">
                    Slide {slideNum}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#11181c] leading-tight mt-0.5">
                    {title}
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <motion.a
                    href={imageSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={interactiveHover}
                    whileTap={interactiveTap}
                    title="View high-res"
                    className="p-1.5 rounded-[6px] text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa]"
                  >
                    <Maximize2 size={13} />
                  </motion.a>
                  <motion.a
                    href={imageSrc}
                    download
                    whileHover={interactiveHover}
                    whileTap={interactiveTap}
                    title="Download figure"
                    className="p-1.5 rounded-[6px] text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa]"
                  >
                    <Download size={13} />
                  </motion.a>
                </div>
              </div>

              {/* Figure Preview Container */}
              <div className="relative w-full aspect-[16/10] bg-[#ffffff] p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={imageSrc}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Card Footer with format downloads */}
              <div className="px-4 py-2.5 bg-[#f8f9fa] border-t border-[#f0f1f3] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#687076]">GCB {edition}</span>
                <div className="flex items-center gap-2">
                  {dataSrc && (
                    <motion.a
                      href={dataSrc}
                      download
                      whileHover={interactiveHover}
                      whileTap={interactiveTap}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0066FF] hover:underline"
                    >
                      <FileText size={11} />
                      <span>Data (CSV)</span>
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
