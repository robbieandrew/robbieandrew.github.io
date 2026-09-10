import React from 'react';
import { motion } from 'framer-motion';
import { Globe2, TrendingDown, Flame, Zap } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function EuPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          European Union CO<span className="subb">2</span> Emissions & Energy
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          High-frequency monthly tracking of EU27 fossil emissions, natural gas supply shifts,
          EU ETS carbon prices, and year-over-year power generation transitions.
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Scope
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">EU-27</span>
          <span className="text-xs text-[#687076] block mt-0.5">Post-Brexit Block</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Gas Demand
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#0066FF]">-18%</span>
          <span className="text-xs text-[#687076] block mt-0.5">Post-2022 Reduction</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            ETS Benchmark
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">EUR 60-80</span>
          <span className="text-xs text-[#687076] block mt-0.5">Per Tonne CO2</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow text-center">
          <span className="text-[11px] font-semibold text-[#687076] uppercase tracking-wider block mb-1">
            Methodology
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#11181c]">CICERO / CREA</span>
          <span className="text-xs text-[#687076] block mt-0.5">Near-Real-Time Models</span>
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
          src="/EU/img/EU27_monthly_CO2.svg"
          title="EU27 Monthly CO2 Emissions"
          subtitle="Estimated monthly territorial carbon dioxide emissions across all 27 member states"
          aspectRatio="16/11"
          notes="Andrew, R. / CICERO & CREA"
        />

        <ChartViewer
          src="/EU/img/EU_CICERO_CREA_CM.svg"
          title="Comparison of Near-Real-Time EU Estimates"
          subtitle="CICERO, CREA, and Carbon Monitor methodology alignment"
          aspectRatio="16/11"
          notes="Updated with Eurostat monthly activity datasets"
        />

        <ChartViewer
          src="/prices/img/natgasprices.svg"
          title="European TTF Natural Gas Prices"
          subtitle="Dutch TTF monthly and daily benchmark price developments"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/EU/img/EUETS_price_weekly.svg"
          title="EU ETS Weekly Carbon Allowance Price"
          subtitle="European Union Emissions Trading System weekly spot settlement (EUR/tCO2)"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/EU/img/EU_natgas_supplyabs.svg"
          title="EU Natural Gas Supply by Pipeline & LNG"
          subtitle="Evolution of absolute import sources including Norway, North Africa, and global LNG"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/EU/img/eu_monthly_gen_changes_lastyear.svg"
          title="EU Electricity Generation Changes (Previous Year)"
          subtitle="Monthly net change by fuel source: solar, wind, nuclear, hydro, coal, and gas"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/EU/img/eu_monthly_gen_changes_thisyear.svg"
          title="EU Electricity Generation Changes (Current Year)"
          subtitle="Latest observed monthly generation shifts across European power grids"
          aspectRatio="16/11"
        />
      </motion.div>
    </div>
  );
}
