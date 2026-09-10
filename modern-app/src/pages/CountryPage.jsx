import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe2,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sliders,
  Tv,
} from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import countriesData from '../data/countries.json';
import countryImagesMap from '../data/countryImagesMap.json';
import {
  EASINGS,
  containerStagger,
  interactiveHover,
  interactiveTap,
} from '../constants/motionConfig';

const POPULAR_ISOS = ['USA', 'NOR', 'CHN', 'IND', 'DEU', 'GBR', 'FRA', 'JPN', 'AUS', 'CAN'];

const DEDICATED_MAP = {
  NOR: { name: 'Norway', target: 'norway' },
  CHN: { name: 'China', target: 'china' },
  IND: { name: 'India', target: 'india' },
  USA: { name: 'United States', target: 'usa' },
  NZL: { name: 'New Zealand', target: 'newzealand' },
  IDN: { name: 'Indonesia', target: 'indonesia' },
  SGP: { name: 'Singapore', target: 'singapore' },
  THA: { name: 'Thailand', target: 'thailand' },
  SWE: { name: 'Sweden', target: 'sweden' },
};

export default function CountryPage({ onNavigateTo }) {
  const [selectedIso, setSelectedIso] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('country') || params.get('iso');
      if (c) return c.toUpperCase();
    }
    return 'NOR';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleSelectIso = (iso) => {
    setSelectedIso(iso);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('country', iso);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Filter available countries from map
  const availableCountries = useMemo(() => {
    return countriesData.filter((c) => countryImagesMap[c.iso?.toUpperCase()]);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return availableCountries.filter(
      (c) =>
        c.names.some((n) => n.toLowerCase().includes(q)) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [searchQuery, availableCountries]);

  const activeCountry = useMemo(() => {
    return (
      availableCountries.find(
        (c) => c.iso.toUpperCase() === selectedIso.toUpperCase()
      ) || availableCountries[0]
    );
  }, [selectedIso, availableCountries]);

  const activeCharts = useMemo(() => {
    return countryImagesMap[activeCountry?.iso?.toUpperCase()] || [];
  }, [activeCountry]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Country Energy and Emissions Charts
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Official estimates as reported to the UNFCCC under national inventories and
          Biennial Transparency Reports (BTR), with historical revision tracking over time.
        </p>

        {/* Action controls */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs">
          <motion.button
            onClick={() => setShowNotes(!showNotes)}
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#11181c] font-medium cursor-pointer"
          >
            <Info size={13} className="text-[#0066FF]" />
            <span>{showNotes ? 'Hide notes' : 'What is this page?'}</span>
            {showNotes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </motion.button>

          <motion.a
            href="/country/random_charts.html"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#687076] hover:text-[#11181c]"
          >
            <Tv size={13} />
            <span>Kiosk Presentation Mode</span>
            <ExternalLink size={11} />
          </motion.a>
        </div>
      </div>

      {/* Explanatory Notes Accordion */}
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
                On this page you will find a curated collection of charts presenting data for a
                single country, where available figures vary by national reporting obligations. In
                many cases, charts showing officially estimated greenhouse gas emissions as
                reported to the UNFCCC are present.
              </p>
              <p>
                These official reports are divided between "Annex 1" (developed) countries and
                "Non-Annex 1" (developing) countries under the new Biennial Transparency Report
                (BTR) framework. Because Annex 1 nations have reported for decades, frequently
                revising their entire historical series, charts visualize these revisions over time.
              </p>
              <p className="text-xs text-[#687076]">
                All charts and accompanying data files are provided under a Creative Commons
                Attribution 4.0 International (CC-BY 4.0) license. Created and maintained by
                Robbie Andrew, CICERO.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Country Selection Controls */}
      <div className="p-6 rounded-[12px] bg-[#ffffff] border border-[#e6e8eb] soft-card-shadow space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Autocomplete Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#687076]">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 138 countries (e.g. Germany, Japan, France)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c] placeholder-[#687076] focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
            />

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#ffffff] rounded-[8px] border border-[#e6e8eb] shadow-md z-30 py-1">
                {searchResults.map((c) => (
                  <button
                    key={c.iso}
                    onClick={() => {
                      handleSelectIso(c.iso);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[#f8f9fa] flex items-center justify-between"
                  >
                    <span className="font-medium text-[#11181c]">{c.names[0]}</span>
                    <span className="text-[11px] text-[#687076] font-mono">{c.iso}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Select Popular Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#687076] mr-1">Popular:</span>
            {POPULAR_ISOS.map((iso) => {
              const matched = availableCountries.find((c) => c.iso === iso);
              if (!matched) return null;
              const isActive = activeCountry?.iso === iso;
              return (
                <motion.button
                  key={iso}
                  onClick={() => handleSelectIso(iso)}
                  whileHover={interactiveHover}
                  whileTap={interactiveTap}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0066FF] text-[#ffffff]'
                      : 'bg-[#f8f9fa] text-[#687076] hover:text-[#11181c] border border-[#e6e8eb]'
                  }`}
                >
                  {matched.names[0]}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Active Country Banner */}
        <div className="pt-2 border-t border-[#f0f1f3] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe2 size={18} className="text-[#0066FF]" />
            <span className="text-base font-bold text-[#11181c]">
              {activeCountry?.names[0]}
            </span>
            <span className="text-xs font-mono text-[#687076] px-1.5 py-0.5 rounded bg-[#f8f9fa] border border-[#e6e8eb]">
              {activeCountry?.iso}
            </span>
            <span className="text-xs text-[#687076]">
              • {activeCharts.length} scientific figures available
            </span>
          </div>

          {/* Dedicated page link if exists */}
          {DEDICATED_MAP[activeCountry?.iso] && (
            <motion.button
              onClick={() => onNavigateTo(DEDICATED_MAP[activeCountry?.iso].target)}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="text-xs font-medium text-[#0066FF] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>See also: Dedicated dashboard for {activeCountry?.names[0]}</span>
              <ExternalLink size={12} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Grid of Country Figures */}
      {activeCharts.length > 0 ? (
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeCharts.map((filename) => {
            const chartPath = `/country/img/${activeCountry.iso}/${filename}`;
            const cleanTitle = filename
              .replace('.svg', '')
              .replace(`${activeCountry.iso}_`, '')
              .replace(/_/g, ' ');
            return (
              <ChartViewer
                key={filename}
                src={chartPath}
                title={cleanTitle}
                subtitle={`${activeCountry.names[0]} (${activeCountry.iso})`}
                notes="UNFCCC / GCP National Inventory"
              />
            );
          })}
        </motion.div>
      ) : (
        <div className="py-16 text-center text-xs text-[#687076]">
          No charts currently cataloged for {activeCountry?.names[0]}.
        </div>
      )}
    </div>
  );
}
