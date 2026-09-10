import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Car, Flame, ExternalLink } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger, interactiveHover, interactiveTap } from '../constants/motionConfig';

export default function ThailandPage({ onNavigateCarsales }) {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Thailand Power Generation & Vehicle Transition
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          High-frequency monthly data on Thailand’s electricity generation mix, thermal emissions,
          and rapid electric passenger vehicle uptake in Southeast Asia’s automotive manufacturing hub.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.button
            onClick={onNavigateCarsales}
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#0066FF] font-medium hover:border-[#0066FF] transition-colors cursor-pointer"
          >
            <span>Explore Global Passenger Car Transition</span>
            <ExternalLink size={12} />
          </motion.button>
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
          src="/thailand/img/ThaiPowerGen.svg"
          title="Thailand Power Generation by Fuel"
          subtitle="Monthly generation by source: natural gas, coal/lignite, hydro, solar, and imports"
          aspectRatio="16/11"
          notes="Energy Policy and Planning Office (EPPO)"
        />

        <ChartViewer
          src="/thailand/img/ThaiCO2.svg"
          title="Thailand Power Sector CO2 Emissions"
          subtitle="Estimated carbon dioxide emissions from power generation"
          aspectRatio="16/11"
          notes="EPPO / Ministry of Energy"
        />

        <ChartViewer
          src="/carsales/img/thailand_carsales_monthly.svg"
          title="Thailand Electric Car Market Share"
          subtitle="Monthly BEV and PHEV percentage share of total passenger car sales"
          aspectRatio="16/11"
        />

        <ChartViewer
          src="/carsales/img/thailand_carsales_monthly_abs.svg"
          title="Thailand Monthly Passenger Car Sales (Units)"
          subtitle="Absolute unit sales trajectory broken down by powertrain"
          aspectRatio="16/11"
        />
      </motion.div>
    </div>
  );
}
