import React from 'react';
import { motion } from 'framer-motion';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function UsaPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          US Energy and CO<span className="subb">2</span> Emissions Information
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Updated monthly from the US Energy Information Administration (EIA) Short-Term Energy
          Outlook (STEO), weather anomalies, and degree days.
        </p>
      </div>

      {/* Grid of USA Charts */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/USA/img/EIAprojection_lines.svg"
          title="EIA STEO Fossil CO2 Projections"
          subtitle="Short-Term Energy Outlook Monthly Series"
          notes="US EIA STEO"
        />

        <ChartViewer
          src="/USA/img/EIAprojection_lines_deseas.svg"
          title="Seasonally Adjusted US CO2"
          subtitle="Deseasonalized Underlying Emissions Trajectory"
          notes="Andrew, R. / CICERO calculation"
        />

        <ChartViewer
          src="/USA/img/two_editions.svg"
          title="Comparison of Successive STEO Editions"
          subtitle="Forecast Revision Shift Analysis"
          notes="US EIA STEO"
        />

        <ChartViewer
          src="/USA/img/EIAprojection_changes.svg"
          title="Projected YoY Emissions Changes"
          subtitle="Annual revisions by STEO release"
          notes="US EIA STEO"
        />

        <ChartViewer
          src="/USA/img/EIA_elecgen.svg"
          title="US Power Generation by Fuel"
          subtitle="Coal, Gas, Nuclear, Solar, Wind"
          notes="US EIA Electricity Monthly"
        />

        <ChartViewer
          src="/USA/img/EIA_elecgen_deseas.svg"
          title="Seasonally Adjusted Power Generation"
          subtitle="Structural Trends in Fuel Switching"
          notes="US EIA STEO"
        />

        <ChartViewer
          src="/USA/img/EIA_CO2_historical_Coal.svg"
          title="Historical Coal CO2 Emissions"
          subtitle="Retirement of Coal Fleet"
          notes="US EIA Monthly Energy Review"
        />

        <ChartViewer
          src="/USA/img/EIA_CO2_historical_Natural_Gas.svg"
          title="Historical Natural Gas CO2 Emissions"
          subtitle="Power & Industrial Consumption"
          notes="US EIA Monthly Energy Review"
        />

        <ChartViewer
          src="/USA/img/EIA_CO2_historical_Oil.svg"
          title="Historical Petroleum CO2 Emissions"
          subtitle="Transportation and Industrial Liquids"
          notes="US EIA Monthly Energy Review"
        />

        <ChartViewer
          src="/country/img/USA/us_gasoline_price.svg"
          title="Average US Gasoline Retail Prices"
          subtitle="Weekly Pump Price Movements"
          notes="US EIA Gasoline & Diesel Fuel Update"
        />

        <ChartViewer
          src="/USA/img/EIA_HDD_cumulative_anomaly.svg"
          title="Heating Degree Days (HDD) Anomalies"
          subtitle="Winter Heating Severity Shifts"
          notes="US EIA / NOAA Weather Anomaly"
        />

        <ChartViewer
          src="/USA/img/EIA_CDD_cumulative_anomaly.svg"
          title="Cooling Degree Days (CDD) Anomalies"
          subtitle="Summer Cooling Power Demand Drivers"
          notes="US EIA / NOAA Weather Anomaly"
        />
      </motion.div>
    </div>
  );
}
