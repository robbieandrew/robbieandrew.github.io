import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, Filter, Languages } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import trucksalesData from '../data/trucksalesData.json';
import { containerStagger } from '../constants/motionConfig';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'no', label: 'Norsk' },
  { code: 'sv', label: 'Svenska' },
  { code: 'zh', label: '中文' },
];

export default function TrucksalesPage() {
  const [frequency, setFrequency] = useState('monthly');
  const [format, setFormat] = useState('relative');
  const [lang, setLang] = useState('en');

  const allCountries = useMemo(() => {
    return trucksalesData.map((c) => c.country).sort();
  }, []);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Collected Vehicle Registration Data: Trucks
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Tracking commercial heavy-duty vehicle decarbonization, battery electric trucks, and
          powertrain transitions across reporting nations.
        </p>
      </div>

      {/* Control Bar */}
      <div className="p-6 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687076] uppercase tracking-wider flex items-center gap-1">
              <Languages size={13} />
              <span>Language</span>
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687076] uppercase tracking-wider flex items-center gap-1">
              <Clock size={13} />
              <span>Time Interval</span>
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c]"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-yearly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687076] uppercase tracking-wider flex items-center gap-1">
              <Filter size={13} />
              <span>Display Format</span>
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c]"
            >
              <option value="relative">Relative Share (%)</option>
              <option value="absolute">Absolute (Units)</option>
              <option value="line">Line Chart Trend</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Truck Charts */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {allCountries.map((country) => {
          const countryKey = country.toLowerCase().replace(/\s+/g, '');
          const formatSuffix =
            format === 'absolute' ? '_abs' : format === 'line' ? '_line' : '';
          const svgPath = `/trucksales/img/${countryKey}_trucksales_${frequency}${formatSuffix}.svg`;
          const dataPath = `/trucksales/data/${countryKey}_trucksales_${frequency}.csv`;

          return (
            <ChartViewer
              key={`${country}_${frequency}_${format}`}
              src={svgPath}
              title={`${country} Commercial Truck Registrations`}
              subtitle={`${frequency.toUpperCase()} • ${format.toUpperCase()}`}
              dataPath={dataPath}
              notes="Official commercial vehicle registrations"
            />
          );
        })}
      </motion.div>
    </div>
  );
}
