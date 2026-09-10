import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Globe, ArrowLeftRight, FileText, Info } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

const POPULAR_ECONOMIES = [
  { iso: 'USA', name: 'United States' },
  { iso: 'CHN', name: 'China' },
  { iso: 'IND', name: 'India' },
  { iso: 'DEU', name: 'Germany' },
  { iso: 'GBR', name: 'United Kingdom' },
  { iso: 'FRA', name: 'France' },
  { iso: 'JPN', name: 'Japan' },
  { iso: 'NOR', name: 'Norway' },
  { iso: 'SWE', name: 'Sweden' },
  { iso: 'AUS', name: 'Australia' },
];

export default function ConsumptionPage() {
  const [selectedIso, setSelectedIso] = useState('USA');
  const [viewMode, setViewMode] = useState('cons'); // 'cons', 'prod', 'trade'

  const activeCountry =
    POPULAR_ECONOMIES.find((e) => e.iso === selectedIso) || POPULAR_ECONOMIES[0];

  const svgSrc = `/consumption/SVG/${selectedIso}_${viewMode}.svg`;
  const csvSrc = `/consumption/CSV/${selectedIso}_${viewMode}.csv`;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Comparison of Consumption-Based Emissions
        </h1>
        <p className="text-sm text-[#687076] max-w-3xl mx-auto">
          While national inventories report territorial emissions, consumption accounting
          re-allocates emissions to where manufactured goods and services are ultimately consumed.
        </p>
      </div>

      {/* Model Sources Card */}
      <div className="p-6 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow space-y-3 text-xs sm:text-sm text-[#11181c] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#11181c]">
          <Info size={14} className="text-[#0066FF]" />
          <span>Multi-Regional Input-Output (MRIO) Modeling Uncertainty</span>
        </div>
        <p>
          Estimates of consumption-based emissions are highly uncertain due to differences in
          trade matrix resolution, economic currency conversions, and emission factors.
        </p>
        <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-[#687076]">
          <span className="px-2 py-0.5 rounded-[4px] bg-[#ffffff] border border-[#e6e8eb]">
            FIGARO (Eurostat)
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#ffffff] border border-[#e6e8eb]">
            Eora Supply Chain Database
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#ffffff] border border-[#e6e8eb]">
            EXIOBASE 3
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#ffffff] border border-[#e6e8eb]">
            OECD Carbon Footprint
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#ffffff] border border-[#e6e8eb]">
            World Input-Output Database (WIOD)
          </span>
        </div>
      </div>

      {/* Control Bar: Country & Metric Switcher */}
      <div className="p-6 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Economy Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#687076] uppercase tracking-wider mr-1">
              Select Country:
            </span>
            {POPULAR_ECONOMIES.map((e) => (
              <button
                key={e.iso}
                onClick={() => setSelectedIso(e.iso)}
                className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-colors cursor-pointer ${
                  selectedIso === e.iso
                    ? 'bg-[#0066FF] text-[#ffffff]'
                    : 'bg-[#f8f9fa] text-[#687076] hover:text-[#11181c] border border-[#e6e8eb]'
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>

          {/* Metric Mode Toggle */}
          <div className="flex rounded-[6px] border border-[#e6e8eb] p-0.5 bg-[#f8f9fa]">
            <button
              onClick={() => setViewMode('cons')}
              className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'cons'
                  ? 'bg-[#ffffff] text-[#11181c] shadow-xs'
                  : 'text-[#687076] hover:text-[#11181c]'
              }`}
            >
              Consumption
            </button>
            <button
              onClick={() => setViewMode('prod')}
              className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'prod'
                  ? 'bg-[#ffffff] text-[#11181c] shadow-xs'
                  : 'text-[#687076] hover:text-[#11181c]'
              }`}
            >
              Production
            </button>
            <button
              onClick={() => setViewMode('trade')}
              className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'trade'
                  ? 'bg-[#ffffff] text-[#11181c] shadow-xs'
                  : 'text-[#687076] hover:text-[#11181c]'
              }`}
            >
              Embodied Trade
            </button>
          </div>
        </div>
      </div>

      {/* Main Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartViewer
            src={svgSrc}
            title={`${activeCountry.name}: ${
              viewMode === 'cons'
                ? 'Consumption-Based Emissions Model Comparison'
                : viewMode === 'prod'
                ? 'Territorial / Production Emissions Comparison'
                : 'Net Embodied Carbon in International Trade'
            }`}
            subtitle={`FIGARO, Eora, EXIOBASE 3, OECD, and Official Reporting`}
            dataPath={csvSrc}
            aspectRatio="16/10"
            notes="Andrew, R. / Multiple MRIO Datasets"
          />
        </div>

        {/* Informational Side Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] space-y-3 text-xs">
            <h4 className="font-bold text-[#11181c] uppercase tracking-wider text-[11px]">
              How to Read This Chart
            </h4>
            <p className="text-[#687076] leading-relaxed">
              If someone in <strong>{activeCountry.name}</strong> purchases an automobile or electronics
              manufactured abroad, the emissions from mining, processing, and assembly in the
              exporting nation are re-allocated to {activeCountry.name} in consumption accounts.
            </p>
            <p className="text-[#687076] leading-relaxed">
              Divergence between datasets reflects varying sector disaggregation (e.g. EXIOBASE's
              high detail vs FIGARO's official EU harmonized supply-use tables).
            </p>
          </div>

          <div className="p-5 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow space-y-2 text-xs">
            <h4 className="font-bold text-[#11181c] uppercase tracking-wider text-[11px]">
              Quick Toggle Metrics
            </h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setViewMode('cons')}
                className="w-full text-left p-2 rounded-[6px] hover:bg-[#f8f9fa] text-xs font-medium text-[#11181c] flex items-center justify-between"
              >
                <span>Consumption Footprint</span>
                <span className="text-[11px] font-mono text-[#0066FF]">.cons</span>
              </button>
              <button
                onClick={() => setViewMode('prod')}
                className="w-full text-left p-2 rounded-[6px] hover:bg-[#f8f9fa] text-xs font-medium text-[#11181c] flex items-center justify-between"
              >
                <span>Territorial Production</span>
                <span className="text-[11px] font-mono text-[#0066FF]">.prod</span>
              </button>
              <button
                onClick={() => setViewMode('trade')}
                className="w-full text-left p-2 rounded-[6px] hover:bg-[#f8f9fa] text-xs font-medium text-[#11181c] flex items-center justify-between"
              >
                <span>Embodied Net Trade</span>
                <span className="text-[11px] font-mono text-[#0066FF]">.trade</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
