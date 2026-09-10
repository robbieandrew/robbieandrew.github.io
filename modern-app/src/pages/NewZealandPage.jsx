import React from 'react';
import { motion } from 'framer-motion';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function NewZealandPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          New Zealand Energy and Emissions
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Quarterly greenhouse gas emissions, renewable electricity generation (hydro,
          geothermal, wind), industrial gas consumption, and fuel pricing.
        </p>
      </div>

      {/* Grid of New Zealand Figures */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/newzealand/img/NZL_qtr_CO2_all.svg"
          title="Quarterly CO2 Emissions by Sector"
          subtitle="Energy, Industry, Transport, Agriculture"
          notes="Stats NZ / MBIE"
        />

        <ChartViewer
          src="/newzealand/img/NZ_monthly_elecgen.svg"
          title="Monthly Electricity Generation"
          subtitle="Hydro, Geothermal, Gas, Wind, Coal"
          notes="Electricity Authority (EMI)"
        />

        <ChartViewer
          src="/newzealand/img/NZL_annual_CO2_all.svg"
          title="Annual Gross & Net CO2 Trajectory"
          subtitle="Long-Term National Inventory"
          notes="Ministry for the Environment"
        />

        <ChartViewer
          src="/newzealand/img/NZL_fuel_prices.svg"
          title="Retail Motor Fuel Prices in New Zealand"
          subtitle="Petrol, Diesel, and Carbon Levy Impact"
          notes="MBIE Energy Prices"
        />

        <ChartViewer
          src="/newzealand/img/NZL_qtrPJ_gas.svg"
          title="Quarterly Natural Gas Consumption"
          subtitle="Petrochemical, Power, and Industrial Demand"
          notes="Gas Industry Company / MBIE"
        />

        <ChartViewer
          src="/newzealand/img/NZL_qtrPJ_coal.svg"
          title="Quarterly Coal Consumption"
          subtitle="Thermal Power & Industrial Process Use"
          notes="MBIE Energy Statistics"
        />
      </motion.div>
    </div>
  );
}
