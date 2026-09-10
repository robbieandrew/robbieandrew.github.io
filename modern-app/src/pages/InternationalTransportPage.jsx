import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Ship, Globe2 } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function InternationalTransportPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Global and International Transport
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Tracking cross-border aviation passenger traffic, cargo flows, and international marine
          bunker fuel dispatches at major global maritime bunkering ports.
        </p>
      </div>

      {/* Grid of Transport Figures */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/internationaltransport/img/IATA_passenger_RPK.svg"
          title="Global Aviation Passenger Traffic (RPK)"
          subtitle="Revenue Passenger-Kilometers Trajectory"
          notes="International Air Transport Association (IATA)"
        />

        <ChartViewer
          src="/internationaltransport/img/IATA_cargo_CTK.svg"
          title="Global Air Cargo Traffic (CTK)"
          subtitle="Cargo Tonne-Kilometers"
          notes="IATA Monthly Statistics"
        />

        <ChartViewer
          src="/internationaltransport/img/OECD_monthly_aviation_CO2.svg"
          title="OECD Aviation CO2 Emissions"
          subtitle="Monthly Aviation Carbon Trajectory"
          notes="OECD / IEA"
        />

        <ChartViewer
          src="/internationaltransport/img/SGP_marinebunkers_monthly.svg"
          title="Singapore Marine Bunker Fuel Sales"
          subtitle="World's largest bunkering hub sales volumes"
          notes="Maritime and Port Authority of Singapore (MPA)"
        />

        <ChartViewer
          src="/internationaltransport/img/rotterdam_bunkers.svg"
          title="Port of Rotterdam Bunker Sales"
          subtitle="Leading European maritime refueling volume"
          notes="Port of Rotterdam Authority"
        />

        <ChartViewer
          src="/internationaltransport/img/panama_bunkers.svg"
          title="Panama Canal Marine Bunkers"
          subtitle="Transit Refueling Statistics"
          notes="Panama Maritime Authority"
        />

        <ChartViewer
          src="/internationaltransport/img/Fujairah_bunker_sales.svg"
          title="Port of Fujairah Bunker Sales"
          subtitle="Middle Eastern bunkering hub"
          notes="Fujairah Oil Industry Zone (FOIZ)"
        />

        <ChartViewer
          src="/china/img/China_monthly_marine_bunkers.svg"
          title="China Monthly Marine Bunkers"
          subtitle="Bonded bunker fuel dispatches"
          notes="General Administration of Customs China"
        />

        <ChartViewer
          src="/internationaltransport/img/HK_bunkers.svg"
          title="Hong Kong Marine Bunkers"
          subtitle="Regional shipping refueling volumes"
          notes="Hong Kong Marine Department"
        />
      </motion.div>
    </div>
  );
}
