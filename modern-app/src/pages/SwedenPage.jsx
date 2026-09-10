import React from 'react';
import { motion } from 'framer-motion';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function SwedenPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Sweden Energy and Fuel Policy
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Tracking the dramatic shifts in Swedish retail fuel prices following modifications to the
          biofuel reduction mandate (reduktionsplikten) and transport emissions.
        </p>
      </div>

      {/* Grid of Sweden Figures */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/sweden/img/sweden_fuel_prices.svg"
          title="Swedish Motor Fuel Prices"
          subtitle="Diesel & Petrol Pump Prices (SEK/litre)"
          notes="Drivkraft Sverige / SPBI"
        />

        <ChartViewer
          src="/sweden/img/sweden_biodiesel_change.svg"
          title="Impact of Reduktionsplikten Modification"
          subtitle="Mandated Biofuel Blending Reductions"
          notes="Swedish Energy Agency (Energimyndigheten)"
        />

        <ChartViewer
          src="/sweden/img/Europe_biofuel_share.svg"
          title="European Biofuel Blending Shares Comparison"
          subtitle="Sweden vs European Neighbors"
          notes="Eurostat / European Commission"
        />

        <ChartViewer
          src="/country/img/SWE/SWE_GCB_fossilCO2.svg"
          title="Sweden Long-Term Fossil CO2 Emissions"
          subtitle="National Inventory & Carbon Budget (1900–present)"
          notes="Global Carbon Project"
        />
      </motion.div>
    </div>
  );
}
