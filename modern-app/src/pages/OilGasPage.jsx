import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Flame } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import sitesData from '../data/oilgasSites.json';
import { containerStagger, interactiveHover, interactiveTap } from '../constants/motionConfig';

const POPULAR_FIELDS = [
  { name: 'ALVHEIM', npdId: '2845712' },
  { name: 'AASTA HANSTEEN', npdId: '23395946' },
  { name: 'BALDER', npdId: '43562' },
  { name: 'GINA KROG', npdId: 'CO2_GINA_KROG' },
];

export default function OilGasPage() {
  const [selectedField, setSelectedField] = useState(POPULAR_FIELDS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = sitesData
    .filter((s) => s.names[0].toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Norway Site-Level Oil and Gas Charts
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Approximate production, energy consumption, and indicative emissions estimates across
          offshore platforms on the Norwegian Continental Shelf.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.a
            href="https://factpages.sodir.no/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#11181c] font-medium"
          >
            <span>Norwegian Offshore Directorate (NPD FactPages)</span>
            <ExternalLink size={12} />
          </motion.a>
        </div>
      </div>

      {/* Control Bar: Search & Quick Field Pills */}
      <div className="p-6 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#687076]">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offshore facility or field name..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c] placeholder-[#687076] focus:outline-none focus:border-[#0066FF]"
            />
            {searchQuery && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#ffffff] border border-[#e6e8eb] rounded-[8px] shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
                {searchResults.map((s) => (
                  <button
                    key={s.npdID}
                    onClick={() => {
                      setSelectedField({ name: s.names[0], npdId: s.npdID });
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left hover:bg-[#f8f9fa] flex items-center justify-between"
                  >
                    <span className="font-medium text-[#11181c]">{s.names[0]}</span>
                    <span className="text-[11px] font-mono text-[#687076]">ID: {s.npdID}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Field Selection */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#687076] mr-1">Major Fields:</span>
            {POPULAR_FIELDS.map((field) => (
              <button
                key={field.npdId}
                onClick={() => setSelectedField(field)}
                className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-colors cursor-pointer ${
                  selectedField.npdId === field.npdId
                    ? 'bg-[#0066FF] text-[#ffffff]'
                    : 'bg-[#f8f9fa] text-[#687076] hover:text-[#11181c] border border-[#e6e8eb]'
                }`}
              >
                {field.name}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[#f0f1f3] flex items-center justify-between text-xs text-[#687076]">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-[#0066FF]" />
            <span className="font-bold text-[#11181c]">{selectedField.name}</span>
            <span>• NPD ID: {selectedField.npdId}</span>
          </div>
          <a
            href={`https://factpages.sodir.no/factpages/default.aspx?nav1=field&nav2=PageView|All&entityid=${selectedField.npdId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0066FF] hover:underline inline-flex items-center gap-1"
          >
            <span>FactPages Record</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Grid of Facility Figures */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src={`/oilgas/img/${selectedField.npdId}/${selectedField.name}_1_production_TJ.svg`}
          title={`${selectedField.name}: Energy Production (TJ)`}
          subtitle="Oil, Gas, and NGL Production Trajectory"
          notes="NPD / Norwegian Continental Shelf"
        />

        <ChartViewer
          src={`/oilgas/img/${selectedField.npdId}/${selectedField.name}_2_consumption.svg`}
          title={`${selectedField.name}: Fuel & Power Consumption`}
          subtitle="Turbine fuel gas, diesel, and shore-power"
          notes="NPD Data"
        />

        <ChartViewer
          src={`/oilgas/img/${selectedField.npdId}/${selectedField.name}_3_emissions.svg`}
          title={`${selectedField.name}: Estimated Emissions`}
          subtitle="Indicative CO2 venting and combustion"
          notes="Andrew, R. / Work in Progress"
        />

        <ChartViewer
          src="/oilgas/img/CO2_GINA_KROG.webp"
          title="Gina Krog Offshore Facility Example"
          subtitle="Facility-level emissions profile"
          notes="Reference Platform Analysis"
        />
      </motion.div>
    </div>
  );
}
