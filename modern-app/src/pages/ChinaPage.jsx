import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sun, Factory, Fuel } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function ChinaPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          China Energy and CO<span className="subb">2</span> Emissions Information
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Frequent updates on China's power capacity additions, solar and wind curtailment,
          electricity generation by source, and passenger EV adoption.
        </p>
      </div>

      {/* Grid of China Charts */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/china/img/CHN_CO2_lines.svg"
          title="China CO2 Emissions Lines"
          subtitle="Monthly & Annual Trajectory"
          notes="Andrew, R. / CICERO"
        />

        <ChartViewer
          src="/china/img/CHN_NEA_monthly_capacity.svg"
          title="NEA Installed Capacity by Fuel Source"
          subtitle="National Energy Administration"
          dataPath="/china/data/CHN_NEA_monthly_capacity.csv"
          notes="National Energy Administration (NEA)"
        />

        <ChartViewer
          src="/china/img/CHN_NEA_monthly_capacity_addition.svg"
          title="Monthly Capacity Additions"
          subtitle="Solar, Wind, Thermal, Hydro"
          dataPath="/china/data/CHN_NEA_monthly_capacity.csv"
          notes="National Energy Administration (NEA)"
        />

        <ChartViewer
          src="/china/img/CHN_NEA_monthly_CUF.svg"
          title="Capacity Utilisation Factor (CUF)"
          subtitle="Thermal, Nuclear, Wind, Solar"
          dataPath="/china/data/CHN_NEA_monthly_CUF_YTD.csv"
          notes="NEA China"
        />

        <ChartViewer
          src="/china/img/china_curtailment.svg"
          title="Wind & Solar Utilisation Rates"
          subtitle="Transmission Constraints & Curtailment"
          dataPath="/china/data/china_windsolar_utilisation.csv"
          notes="National Renewable Energy Center"
        />

        <ChartViewer
          src="/china/img/NEA_solar_detail.svg"
          title="Solar PV Detail: Centralized vs Distributed"
          subtitle="Rooftop vs Utility-Scale Additions"
          notes="NEA China"
        />

        {/* Video Animation */}
        <ChartViewer
          src="/china/img/CHN_provsolar.mp4"
          title="Provincial Solar Rollout Animation"
          subtitle="Spatial Diffusion Across Chinese Provinces"
          notes="Automated Geospatial Animation"
        />

        <ChartViewer
          src="/china/img/CHN_elygen_line.svg"
          title="Monthly Electricity Generation"
          subtitle="National Bureau of Statistics (NBS)"
          notes="NBS China"
        />

        <ChartViewer
          src="/china/img/CHN_carsales.svg"
          title="New Energy Vehicle (NEV) Penetration"
          subtitle="BEV & PHEV Registration Shares"
          notes="CPCA / CAAM"
        />

        <ChartViewer
          src="/china/img/china_truck_sales.svg"
          title="Commercial Truck Registrations"
          subtitle="Heavy Duty Electrification"
          notes="China Auto Data"
        />

        <ChartViewer
          src="/china/img/china_ev_charging.svg"
          title="EV Charging Infrastructure Growth"
          subtitle="Public & Private Fast Chargers"
          notes="EVCIPA"
        />

        <ChartViewer
          src="/china/img/cpca_weekly_skyline.svg"
          title="CPCA Weekly Passenger Car Registrations"
          subtitle="High-frequency Sales Skyline"
          notes="China Passenger Car Association"
        />

        <ChartViewer
          src="/china/img/NBS_petrrefining.svg"
          title="Petroleum Refining Throughput"
          subtitle="Crude Oil Processing (NBS)"
          notes="NBS China"
        />

        <ChartViewer
          src="/china/img/coal_and_lignite_imports.svg"
          title="Coal & Lignite Imports"
          subtitle="General Administration of Customs"
          notes="China Customs"
        />

        <ChartViewer
          src="/china/img/CHN_growth.svg"
          title="Key Industrial Output Indicators"
          subtitle="Cement, Steel, Electricity, Coal"
          notes="NBS China"
        />
      </motion.div>
    </div>
  );
}
