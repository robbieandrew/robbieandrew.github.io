import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Factory, Globe2 } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function IndonesiaPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Indonesia Coal, Energy & Industry
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          Tracking coal export dynamics, primary energy supply balances, and heavy industrial
          decarbonization for Southeast Asia's largest thermal coal exporter.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Global Role
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">#1 Exporter</span>
          <span className="text-xs text-[#687076] block mt-0.5">Thermal Coal</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Primary Supply
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#0066FF]">Coal Dominant</span>
          <span className="text-xs text-[#687076] block mt-0.5">Rapid Power Expansion</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Key Sectors
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">Nickel & Cement</span>
          <span className="text-xs text-[#687076] block mt-0.5">Captive Power Use</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Source Data
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">BPS & ESDM</span>
          <span className="text-xs text-[#687076] block mt-0.5">Indonesian Ministries</span>
        </div>
      </div>

      {/* Figures Grid */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <ChartViewer
          src="/indonesia/img/IDN_coal_exports.svg"
          title="Indonesia Monthly Coal Exports"
          subtitle="Monthly seaborne thermal coal exports by destination country"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/indonesia/img/IDN_coal_exports_annual.svg"
          title="Annual Coal Exports Trajectory"
          subtitle="Long-term annual coal export volumes to Asian and international markets"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/indonesia/img/IDN_energysupply.svg"
          title="Total Primary Energy Supply (TPES)"
          subtitle="Energy balance evolution: coal, crude oil, natural gas, biofuels, and hydro"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/indonesia/img/IDN_industry.svg"
          title="Industrial Energy Demand"
          subtitle="Energy consumption trends across Indonesian heavy manufacturing and processing"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/indonesia/img/IDN_industrysector.svg"
          title="Industrial Sub-Sector Breakdown"
          subtitle="Detailed disaggregation by basic metals, chemicals, non-metallic minerals, and food"
          aspectRatio="16/11"
        />
      </motion.div>
    </div>
  );
}
