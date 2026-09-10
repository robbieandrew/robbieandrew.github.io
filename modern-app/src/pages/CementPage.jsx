import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ExternalLink, BookOpen } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger, interactiveHover, interactiveTap } from '../constants/motionConfig';

export default function CementPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Cement and its Emissions
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Quantifying the difficult-to-abate process emissions resulting from the chemical
          calcination of limestone (CaCO<span className="subb">3</span> &rarr; CaO + CO<span className="subb">2</span>) in clinker
          manufacturing worldwide.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.a
            href="https://doi.org/10.5281/zenodo.831454"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0066FF] text-[#ffffff] font-medium shadow-xs"
          >
            <span>Zenodo Cement Dataset</span>
            <ExternalLink size={12} />
          </motion.a>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-6 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow space-y-3 text-xs sm:text-sm text-[#11181c] leading-relaxed">
        <h3 className="text-sm font-bold text-[#11181c]">Process Emissions vs Fuel Combustion</h3>
        <p>
          Concrete is the second most consumed material on Earth after water, and cement is the
          binder holding it together. Unlike most sectors where emissions stem solely from burning
          coal or oil, cement emissions are predominantly <em>chemical process emissions</em>.
        </p>
        <p className="text-xs text-[#687076]">
          As part of the Global Carbon Budget, Robbie Andrew maintains an independent global
          clinker production dataset for every country, documented in <em>Earth System Science Data</em>.
        </p>
      </div>

      {/* Grid of Cement Charts */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <ChartViewer
          src="/cement/img/global_CO2_cement.svg"
          title="Global Cement Process Emissions"
          subtitle="Carbonate decomposition vs fuel combustion"
          notes="Andrew, R. ESSD 2019 / Zenodo"
        />

        <ChartViewer
          src="/cement/img/global_cement_production.svg"
          title="Annual Global Cement Production"
          subtitle="National Production Volumes (1930–present)"
          notes="Andrew, R. / Zenodo archive"
        />
      </motion.div>
    </div>
  );
}
