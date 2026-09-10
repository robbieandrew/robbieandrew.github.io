import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  Languages,
} from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import carsalesData from '../data/carsalesData.json';
import {
  EASINGS,
  containerStagger,
  interactiveHover,
  interactiveTap,
} from '../constants/motionConfig';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'da', label: 'Dansk' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'fi', label: 'Suomi' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'no', label: 'Norsk (bokmål)' },
  { code: 'pl', label: 'Polski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'zh', label: '中文' },
];

export default function CarsalesPage() {
  const [frequency, setFrequency] = useState('monthly');
  const [format, setFormat] = useState('relative');
  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [selectedCountryNames, setSelectedCountryNames] = useState([
    'Norway',
    'Sweden',
    'Germany',
    'United Kingdom',
    'China',
    'United States',
    'France',
    'Netherlands',
  ]);

  const allCountries = useMemo(() => {
    return carsalesData.map((c) => c.country).sort();
  }, []);

  const filteredCountries = useMemo(() => {
    return allCountries.filter((country) => {
      const matchesSearch =
        !searchQuery.trim() ||
        country.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const isSelected =
        selectedCountryNames.length === 0 ||
        selectedCountryNames.includes(country);
      return matchesSearch && isSelected;
    });
  }, [allCountries, searchQuery, selectedCountryNames]);

  const toggleCountry = (country) => {
    if (selectedCountryNames.includes(country)) {
      setSelectedCountryNames(selectedCountryNames.filter((c) => c !== country));
    } else {
      setSelectedCountryNames([...selectedCountryNames, country]);
    }
  };

  const selectAll = () => setSelectedCountryNames([...allCountries]);
  const clearAll = () => setSelectedCountryNames([]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Collected Vehicle Registration Data
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          High-frequency monitoring of passenger vehicle electrification (BEV, PHEV, HEV, ICE)
          across global markets.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.button
            onClick={() => setShowNotes(!showNotes)}
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#11181c] font-medium cursor-pointer"
          >
            <Info size={13} className="text-[#0066FF]" />
            <span>{showNotes ? 'Hide notes' : 'Show explanatory notes'}</span>
            {showNotes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </motion.button>

          <motion.a
            href="/carsales/data/all_carsales_monthly.csv"
            download
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0066FF] text-[#ffffff] font-medium shadow-xs"
          >
            <Download size={13} />
            <span>Download all monthly data (CSV)</span>
          </motion.a>
        </div>
      </div>

      {/* Explanatory Notes */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASINGS.materialEntrance }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] text-xs sm:text-sm text-[#11181c] space-y-3 leading-relaxed">
              <p>
                <strong>Important Terminology:</strong> ICE (Internal Combustion Engine), BEV
                (Battery Electric Vehicle), PHEV (Plug-in Hybrid), HEV (Hybrid Electric), MHEV
                (Mild Hybrid with auto stop-start), FCEV (Fuel Cell Hydrogen).
              </p>
              <p>
                <strong>Registrations vs Sales:</strong> Most series represent new registrations,
                near-coincident with sale. In some jurisdictions, dealers pre-register vehicles to
                preempt regulatory fee shifts. Also, in smaller nations like Netherlands and
                Denmark, used imported cars represent a substantial influx of newly added vehicles.
              </p>
              <p className="text-xs text-[#687076]">
                Spikes frequently correlate with license plate changes (UK/Ireland), fiscal year
                closings (March in Japan), or end-of-year sales quotas (China).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar: Language, Interval, Format, Countries */}
      <div className="p-6 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Chart Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687076] uppercase tracking-wider flex items-center gap-1">
              <Languages size={13} />
              <span>Chart Language</span>
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c] focus:outline-none focus:border-[#0066FF]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Interval */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687076] uppercase tracking-wider flex items-center gap-1">
              <Clock size={13} />
              <span>Time Interval</span>
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c] focus:outline-none focus:border-[#0066FF]"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-yearly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          {/* Display Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687076] uppercase tracking-wider flex items-center gap-1">
              <Filter size={13} />
              <span>Display Format</span>
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c] focus:outline-none focus:border-[#0066FF]"
            >
              <option value="relative">Relative Share (%)</option>
              <option value="absolute">Absolute (Units)</option>
              <option value="line">Line Chart Trend</option>
            </select>
          </div>

          {/* Quick Country Toggle Summary */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#687076]">
              <span className="font-semibold uppercase tracking-wider">Markets</span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-[#0066FF] hover:underline cursor-pointer"
                >
                  All
                </button>
                <span>•</span>
                <button
                  onClick={clearAll}
                  className="text-[#687076] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="text-xs text-[#11181c] font-medium py-2 px-3 rounded-[6px] bg-[#f8f9fa] border border-[#e6e8eb] flex items-center justify-between">
              <span>Showing {filteredCountries.length} countries</span>
              <span className="text-[11px] text-[#687076]">
                ({selectedCountryNames.length} selected)
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Select Country Pills */}
        <div className="pt-2 border-t border-[#f0f1f3]">
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
            {allCountries.map((country) => {
              const isSelected = selectedCountryNames.includes(country);
              return (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0066FF] text-[#ffffff]'
                      : 'bg-[#f8f9fa] text-[#687076] hover:text-[#11181c] border border-[#e6e8eb]'
                  }`}
                >
                  {country}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Vehicle Charts */}
      {filteredCountries.length > 0 ? (
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCountries.map((country) => {
            const countryKey = country.toLowerCase().replace(/\s+/g, '');
            const formatSuffix =
              format === 'absolute' ? '_abs' : format === 'line' ? '_line' : '';
            const svgPath = `/carsales/img/${countryKey}_carsales_${frequency}${formatSuffix}.svg`;
            const dataPath = `/carsales/data/${countryKey}_carsales_${frequency}.csv`;

            return (
              <ChartViewer
                key={`${country}_${frequency}_${format}`}
                src={svgPath}
                title={`${country} Passenger Vehicle Sales`}
                subtitle={`${frequency.toUpperCase()} • ${format.toUpperCase()}`}
                dataPath={dataPath}
                notes="Collated from official registrations"
              />
            );
          })}
        </motion.div>
      ) : (
        <div className="py-16 text-center text-xs text-[#687076]">
          No countries currently selected. Use the pills above to add markets.
        </div>
      )}
    </div>
  );
}
