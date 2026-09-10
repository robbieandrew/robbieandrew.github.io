import React from 'react';
import { motion } from 'framer-motion';
import { Database, ExternalLink, Info, Layers } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger, interactiveHover, interactiveTap } from '../constants/motionConfig';

export default function FossilCo2Page() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Fossil CO<span className="subb">2</span> Datasets & Extraction Accounts
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          Understanding the genealogical architecture, relationships, and methodological
          differences across global greenhouse gas inventories, primary energy databases, and
          extraction-based emissions.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.a
            href="https://doi.org/10.5281/zenodo.5569234"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0066FF] text-[#ffffff] font-medium shadow-xs"
          >
            <span>Zenodo Permanent Archive (1750–2024)</span>
            <ExternalLink size={12} />
          </motion.a>
        </div>
      </div>

      {/* Explanatory Taxonomy Card */}
      <div className="p-6 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow space-y-3 text-xs sm:text-sm text-[#11181c] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#11181c]">
          <Database size={15} className="text-[#0066FF]" />
          <span>Relationships Between Global Emissions Inventories</span>
        </div>
        <p>
          Because the largest source of fossil CO<span className="subb">2</span> is the oxidation of fossil fuels,
          energy databases (IEA, UN Energy Statistics, US EIA) serve as the foundation. The next
          largest source is the thermal decomposition of carbonates, particularly in cement clinker
          production.
        </p>
        <p className="text-xs text-[#687076]">
          Secondary datasets (such as GCP, CDIAC, EDGAR, and CEDS) synthesize these primary flows
          with independent fugitive flaring and industrial process estimates to build globally
          consistent multi-century records.
        </p>
      </div>

      {/* Figures */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <ChartViewer
          src="/fossilco2/img/Figure1_datasets_210725i.svg"
          title="Taxonomy & Lineage of Global Fossil CO2 Datasets"
          subtitle="How primary energy databases feed into global emissions accounts"
          aspectRatio="16/11"
          notes="Andrew, R. 2021 / CICERO"
        />

        <ChartViewer
          src="/GCB2023/extraction/extraction_based_emissions.webp"
          title="National Extraction-Based Emissions"
          subtitle="Emissions attributed to the extraction point of fossil reserves"
          aspectRatio="16/11"
          notes="Global Carbon Project / Andrew, R."
        />
      </motion.div>
    </div>
  );
}
