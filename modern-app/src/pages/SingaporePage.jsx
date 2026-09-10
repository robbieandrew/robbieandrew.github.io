import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, Globe2, Ship, Droplets } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function SingaporePage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Singapore & Marine Bunkering Hubs
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          Tracking marine fuel sales at the world's largest bunkering port, fuel oil vs low-sulfur
          transitions, and international maritime fuel volume benchmarks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Global Rank
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">#1 Port</span>
          <span className="text-xs text-[#687076] block mt-0.5">Marine Bunkering</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Annual Volume
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#0066FF]">&gt;50 Mt</span>
          <span className="text-xs text-[#687076] block mt-0.5">Bunker Fuel Sales</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Regulation
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">IMO 2020</span>
          <span className="text-xs text-[#687076] block mt-0.5">VLSFO & Scrubber Shifts</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Source
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">MPA</span>
          <span className="text-xs text-[#687076] block mt-0.5">Maritime & Port Authority</span>
        </div>
      </div>

      {/* Figures Grid */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/singapore/img/SGP_marinebunkers.svg"
          title="Singapore Marine Bunker Sales"
          subtitle="Monthly breakdown by grade: LSFO, MFO, LSMGO, and emerging biofuels"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/singapore/img/bunkers_SGP.svg"
          title="Historical Bunker Sales Trend"
          subtitle="Multi-year evolution of total marine fuel volume delivered at Singapore"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/singapore/img/bunker_fuels_top10.svg"
          title="Top 10 Global Bunkering Hubs"
          subtitle="Comparing Singapore, Rotterdam, Fujairah, Zhoushan, Panama, and other global ports"
          aspectRatio="16/11"
        />
      </motion.div>
    </div>
  );
}
