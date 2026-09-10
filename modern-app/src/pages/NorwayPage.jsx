import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Plane, Factory, Zap, ExternalLink, Filter } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger, interactiveHover, interactiveTap } from '../constants/motionConfig';

const NORWAY_CHARTS = [
  // Overview
  {
    category: 'Overview',
    src: '/norway/img/kilde9_line_en.svg',
    title: 'Norwegian Greenhouse Gas Emissions by Source',
    subtitle: 'Historical sector contributions: oil & gas extraction, transport, industry, agriculture',
    notes: 'Statistics Norway (SSB) & Norwegian Environment Agency',
  },
  {
    category: 'Overview',
    src: '/norway/img/fuelsales.svg',
    title: 'Domestic Fuel Sales in Norway',
    subtitle: 'Autodiesel, motor gasoline, and bio-fuel mandate blends',
    notes: 'SSB Monthly Petroleum Sales',
  },
  {
    category: 'Overview',
    src: '/norway/img/thermal_power_gen_norway.svg',
    title: 'Thermal Power Generation in Norway',
    subtitle: 'Gas turbines and industrial thermal plants in a predominantly hydro grid',
  },

  // Offshore Oil & Gas
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/fueluse_oilgas.svg',
    title: 'Offshore Fuel Use in Petroleum Extraction',
    subtitle: 'Natural gas combustion in offshore turbines for power generation on platforms',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/production_by_field.svg',
    title: 'Hydrocarbon Production by Offshore Field',
    subtitle: 'Field-level oil, gas, and NGL outputs across the Norwegian Continental Shelf',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/flaring_by_site.svg',
    title: 'Offshore Gas Flaring by Facility',
    subtitle: 'Operational and safety flaring volumes reported by operators',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/CO2_GINA_KROG.svg',
    title: 'Emissions Profile: Gina Krog Field',
    subtitle: 'Case study of electrification and platform emissions trajectory',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/production_oilgas.svg',
    title: 'Norway Total Oil and Gas Production',
    subtitle: 'Long-term historical output (million standard cubic metres oil equivalents)',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/production_oilgas_PJ.svg',
    title: 'Petroleum Production in Petajoules (PJ)',
    subtitle: 'Energy content equivalence between extracted crude oil and natural gas',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/norskoljegassCO2.svg',
    title: 'Offshore Sector Emissions & Offshore Norge Targets',
    subtitle: 'Emissions from continental shelf operations vs industry climate roadmaps',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/onshore_gas_co2.svg',
    title: 'Onshore Gas Processing Facilities CO2',
    subtitle: 'Emissions from Kårstø, Kollsnes, Melkøya LNG, and Tjeldbergodden',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/injection.svg',
    title: 'Offshore CO2 Injection & Sub-seabed Storage',
    subtitle: 'Historical carbon capture and storage at Sleipner and Snøhvit fields',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/NorskOljeGassUtslipp_2030.svg',
    title: 'Offshore 2030 Emissions Projections',
    subtitle: 'Power-from-shore electrification projects and abatement estimates',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/NOR_FF_exports.svg',
    title: 'Embodied Emissions in Norwegian Fossil Fuel Exports',
    subtitle: 'Comparing domestic territorial emissions with exported combustion emissions',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/oljeprognoser_en.svg',
    title: 'Norwegian Offshore Directorate Production Forecasts',
    subtitle: 'Historical forecast revisions vs actual extraction volumes',
  },
  {
    category: 'Offshore Oil & Gas',
    src: '/norway/img/havbase_CO2_lines.svg',
    title: 'Maritime Emissions in Norwegian Waters (Havbase)',
    subtitle: 'AIS-tracked vessel emissions: fishing, cargo, passenger, and offshore supply',
  },

  // Transport & Industry
  {
    category: 'Transport & Industry',
    src: '/norway/img/Norwegian_travel_by_plane.svg',
    title: 'Aviation Activity in Norway',
    subtitle: 'Domestic and international flights and passenger travel volumes',
  },
  {
    category: 'Transport & Industry',
    src: '/norway/img/Norwegian_travel_by_plane_disagg.svg',
    title: 'Aviation Emissions Disaggregation',
    subtitle: 'Jet kerosene combustion across domestic routes and international departures',
  },
  {
    category: 'Transport & Industry',
    src: '/norway/img/NOR_top10_pointsource.svg',
    title: 'Top 10 Industrial Point Sources in Norway',
    subtitle: 'Largest single emission installations (refineries, smelters, gas terminals)',
  },
  {
    category: 'Transport & Industry',
    src: '/norway/img/top-norway-changes_2023.svg',
    title: 'Largest Point Source Changes (2023)',
    subtitle: 'Facilities with the greatest emission reductions and increases in 2023',
  },
  {
    category: 'Transport & Industry',
    src: '/norway/img/top-norway-changes_2024.svg',
    title: 'Largest Point Source Changes (2024)',
    subtitle: 'Latest annual facility-level emission variances reported to the Environment Agency',
  },
];

const CATEGORIES = ['All', 'Overview', 'Offshore Oil & Gas', 'Transport & Industry'];

export default function NorwayPage({ onNavigateEv }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCharts =
    activeCategory === 'All'
      ? NORWAY_CHARTS
      : NORWAY_CHARTS.filter((c) => c.category === activeCategory);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Norway Energy, Offshore & Emissions
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          Comprehensive data on Norway’s continental shelf oil and gas extraction, facility-level
          point sources, aviation, domestic fuel sales, and power generation.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.button
            onClick={onNavigateEv}
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#0066FF] font-medium hover:border-[#0066FF] transition-colors cursor-pointer"
          >
            <span>See Norwegian Electric Vehicles Chronicle (EV)</span>
            <ExternalLink size={12} />
          </motion.button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className={`px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#0066FF] text-[#ffffff] shadow-xs'
                : 'bg-[#f8f9fa] text-[#687076] hover:text-[#11181c] border border-[#e6e8eb]'
            }`}
          >
            {cat} {cat !== 'All' && `(${NORWAY_CHARTS.filter((c) => c.category === cat).length})`}
          </motion.button>
        ))}
      </div>

      {/* Figures Grid */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        key={activeCategory}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredCharts.map((chart) => (
          <ChartViewer
            key={chart.src}
            src={chart.src}
            title={chart.title}
            subtitle={chart.subtitle}
            aspectRatio="16/11"
            notes={chart.notes}
          />
        ))}
      </motion.div>
    </div>
  );
}
