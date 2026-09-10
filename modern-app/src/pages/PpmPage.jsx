import React from 'react';
import { motion } from 'framer-motion';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function PpmPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Atmospheric Concentration of CO<span className="subb">2</span>
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Weekly observations from the Mauna Loa Observatory (Keeling Curve), northern hemisphere
          biospheric cycles, and El Niño sea-surface temperature anomalies.
        </p>
      </div>

      {/* Grid of PPM Charts */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/ppm/img/MLO_weeklyGW.png"
          title="Mauna Loa Weekly Atmospheric CO2"
          subtitle="Long-Term Global Warming Trajectory"
          notes="Scripps / NOAA ESRL"
        />

        <ChartViewer
          src="/ppm/img/MLO_weekly_drivers.mp4"
          title="Weekly Drivers Animation"
          subtitle="Seasonal Biospheric Inhale & Exhale Cycle"
          notes="Keeling Curve Analysis"
        />

        <ChartViewer
          src="/ppm/img/MLO_weekly.mp4"
          title="Weekly Keeling Curve Animation"
          subtitle="Continuous high-frequency atmospheric concentration record"
          notes="Scripps Institution of Oceanography / NOAA"
        />

        <ChartViewer
          src="/ppm/img/SST_anomalies_N34_NOAA_NOAA.svg"
          title="El Niño Sea-Surface Temperature Anomalies"
          subtitle="Niño 3.4 SST Index vs Atmospheric Growth"
          notes="Copernicus Climate Change Service / NOAA"
        />

        <ChartViewer
          src="/ppm/img/s46_AtmosConc_update.svg"
          title="Annual Atmospheric Growth Rate"
          subtitle="Global Carbon Budget Atmospheric Sink"
          notes="Global Carbon Project"
        />
      </motion.div>
    </div>
  );
}
