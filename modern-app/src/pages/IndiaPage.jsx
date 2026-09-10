import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sun, Wind, TrendingUp, TrendingDown, BookOpen, Copy, Check } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import {
  containerStagger,
  interactiveHover,
  interactiveTap,
} from '../constants/motionConfig';

const KPIS = [
  {
    label: 'Coal production: Total',
    period: 'July 2026',
    value: '69.8',
    unit: 'Mt',
    tag: 'Second-highest ever for July',
    delta: 'up 7.6%',
    baseline: 'from July 2025',
    isPositive: true,
  },
  {
    label: 'Coal imports',
    period: 'June 2026',
    value: '19.7',
    unit: 'Mt',
    tag: null,
    delta: 'down -10.2%',
    baseline: 'from June 2025',
    isPositive: false,
  },
  {
    label: 'Solar power generation',
    period: 'August 2026',
    value: '16.8',
    unit: 'TWh',
    tag: 'Highest ever for August',
    delta: 'up 34.1%',
    baseline: 'from August 2025',
    isPositive: true,
  },
  {
    label: 'Wind power generation',
    period: 'August 2026',
    value: '17.2',
    unit: 'TWh',
    tag: 'Second-highest ever',
    delta: 'up 55.7%',
    baseline: 'from August 2025',
    isPositive: true,
  },
];

export default function IndiaPage() {
  const [copied, setCopied] = useState(false);
  const citationText = `Andrew, R. 2020: "Timely estimates of India's annual and monthly fossil CO2 emissions", Earth System Science Data 12, 2411–2421, DOI: 10.5194/essd-12-2411-2020.`;

  const copyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Indian Energy and Emissions Data
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          High-frequency data on thermal generation, coal logistics, and rapid renewable
          deployment across Indian states.
        </p>
        <p className="text-xs text-[#687076]">Last updated: 8 September 2026</p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi, idx) => (
          <motion.div
            key={idx}
            whileHover={interactiveHover}
            className="p-5 rounded-[12px] bg-[#f8f9fa] border border-[#f0f1f3] soft-card-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#687076]">
                <span className="font-semibold text-[#11181c]">{kpi.label}</span>
                <span>{kpi.period}</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#11181c] tracking-tight">
                  {kpi.value}
                </span>
                <span className="text-sm font-semibold text-[#687076]">{kpi.unit}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e6e8eb] space-y-1">
              {kpi.tag && (
                <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#0066FF]/10 text-[#0066FF] text-[11px] font-semibold">
                  {kpi.tag}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs">
                <span className={`font-bold ${kpi.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {kpi.delta}
                </span>
                <span className="text-[#687076]">{kpi.baseline}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scientific Citation Notice */}
      <div className="p-4 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#11181c]">
          <BookOpen size={16} className="text-[#0066FF]" />
          <span>
            Data originally collated for{' '}
            <em>Earth System Science Data (ESSD 2020)</em> open-access publication.
          </span>
        </div>
        <motion.button
          onClick={copyCitation}
          whileHover={interactiveHover}
          whileTap={interactiveTap}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#11181c] hover:border-[#0066FF] cursor-pointer"
        >
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy paper citation'}</span>
        </motion.button>
      </div>

      {/* Figures Grid */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/india/img/monthly_coal_full.webp"
          title="Indian Monthly Coal Production & Dispatches"
          subtitle="Ministry of Coal Monthly Statistics"
          dataPath="/india/data/monthly_coal.csv"
          notes="Ministry of Coal / POSOCO"
        />
        <ChartViewer
          src="/india/img/POSOCO_solar.svg"
          title="Daily Solar Generation"
          subtitle="Grid-India (POSOCO) National Dispatch"
          dataPath="/india/data/POSOCO_data.csv"
          notes="POSOCO / Grid-India"
        />
        <ChartViewer
          src="/india/img/POSOCO_wind.svg"
          title="Daily Wind Generation"
          subtitle="Grid-India (POSOCO) National Dispatch"
          dataPath="/india/data/POSOCO_data.csv"
          notes="POSOCO / Grid-India"
        />
        <ChartViewer
          src="/india/img/annual_capacity_additions_all.svg"
          title="Annual Power Capacity Additions"
          subtitle="Solar, Wind, Hydro, and Thermal Capacity Additions"
          dataPath="/india/data/India_capacity_additions_annual_data.csv"
          notes="Central Electricity Authority (CEA)"
        />
        <ChartViewer
          src="/india/img/POSOCO_total.svg"
          title="Daily Electricity Demand & Total Generation"
          subtitle="Grid-Controller of India (POSOCO)"
          dataPath="/india/data/POSOCO_data.csv"
          notes="POSOCO Daily Reports"
        />
        <ChartViewer
          src="/india/img/CO2_all_2008.svg"
          title="Timely Estimates of India's Fossil CO2"
          subtitle="Monthly emissions from coal, oil, gas, cement"
          notes="Andrew, R. ESSD 2020"
        />
        <ChartViewer
          src="/india/img/generation_shares.svg"
          title="Power Generation Shares by Source"
          subtitle="Evolution of Coal, Renewables, Hydro, Gas, Nuclear"
          notes="CEA Monthly Statistics"
        />
        <ChartViewer
          src="/country/img/IND/IND_GCB_fossilCO2.svg"
          title="India Long-Term Fossil CO2 Emissions"
          subtitle="Global Carbon Budget (1900–present)"
          notes="Global Carbon Project"
        />
        <ChartViewer
          src="/india/img/india_halfdeg.mp4"
          title="Indian Gridded Temperature Anomalies Animation"
          subtitle="Spatial temperature variance time-series animation"
          notes="India Meteorological Department (IMD) / Andrew, R."
        />
        <ChartViewer
          src="/india/img/india_rainfall.mp4"
          title="Monsoon Rainfall Distribution Animation"
          subtitle="Sub-divisional historical rainfall pattern evolution"
          notes="IMD Gridded Rainfall Series"
        />
      </motion.div>
    </div>
  );
}
