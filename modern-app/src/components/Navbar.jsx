import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Globe2,
  Car,
  Flame,
  Zap,
  TrendingUp,
  BatteryCharging,
  Wind,
  Layers,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Truck,
  DollarSign,
  Plane,
  Database,
  ArrowLeftRight,
  Ship,
  Factory,
} from 'lucide-react';
import { interactiveHover, interactiveTap, EASINGS } from '../constants/motionConfig';

export const PRIMARY_PAGES = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'gcb', label: 'Global Carbon Budget', icon: Globe2 },
  { id: 'country', label: 'Country Charts', icon: Globe2 },
  { id: 'carsales', label: 'Vehicle Transition', icon: Car },
  { id: 'india', label: 'India Energy', icon: Flame },
  { id: 'china', label: 'China Energy', icon: Zap },
  { id: 'usa', label: 'USA Energy', icon: TrendingUp },
];

export const MORE_PAGES = [
  { id: 'eu', label: 'European Union', icon: Globe2 },
  { id: 'norway', label: 'Norway Energy & Offshore', icon: Flame },
  { id: 'ev', label: 'Norway EV Chronicle', icon: BatteryCharging },
  { id: 'indonesia', label: 'Indonesia Coal & Energy', icon: Flame },
  { id: 'singapore', label: 'Singapore Marine Bunkers', icon: Ship },
  { id: 'thailand', label: 'Thailand Power & Cars', icon: Zap },
  { id: 'trucksales', label: 'Truck Decarbonization', icon: Truck },
  { id: 'consumption', label: 'Consumption Accounting', icon: ArrowLeftRight },
  { id: 'ppm', label: 'Atmospheric CO2', icon: Wind },
  { id: 'cement', label: 'Cement Emissions', icon: Layers },
  { id: 'oilgas', label: 'Norwegian Oil & Gas', icon: Flame },
  { id: 'prices', label: 'Commodities & Carbon Prices', icon: DollarSign },
  { id: 'transport', label: 'Aviation & Marine Bunkers', icon: Plane },
  { id: 'newzealand', label: 'New Zealand', icon: Globe2 },
  { id: 'sweden', label: 'Sweden Fuel Policy', icon: Globe2 },
  { id: 'fossilco2', label: 'Fossil CO2 & Extraction', icon: Database },
];

export default function Navbar({ activePage, setActivePage, onOpenUpdates }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#ffffff]/95 backdrop-blur-md border-b border-[#f0f1f3]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Author Branding */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setActivePage('home')}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="flex items-center gap-2 text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-[6px] bg-[#0066FF] flex items-center justify-center text-[#ffffff] font-bold text-xs">
                RA
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#11181c] leading-tight">
                  Robbie Andrew
                </span>
                <span className="text-[11px] text-[#687076] leading-tight hidden sm:inline">
                  CICERO Climate Research
                </span>
              </div>
            </motion.button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {PRIMARY_PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;
              return (
                <motion.button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  whileHover={interactiveHover}
                  whileTap={interactiveTap}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0066FF] text-[#ffffff]'
                      : 'text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <Icon size={13} />
                  <span>{page.label}</span>
                </motion.button>
              );
            })}

            {/* "More Dashboards" Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={interactiveHover}
                whileTap={interactiveTap}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa] cursor-pointer"
              >
                <span>More ({MORE_PAGES.length})</span>
                <ChevronDown size={13} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: EASINGS.materialEntrance }}
                      className="absolute right-0 mt-1 w-60 py-1.5 bg-[#ffffff] rounded-[12px] border border-[#e6e8eb] soft-card-shadow z-20 max-h-96 overflow-y-auto"
                    >
                      {MORE_PAGES.map((page) => {
                        const Icon = page.icon;
                        const isActive = activePage === page.id;
                        return (
                          <button
                            key={page.id}
                            onClick={() => {
                              setActivePage(page.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-[#0066FF] text-[#ffffff]'
                                : 'text-[#11181c] hover:bg-[#f8f9fa]'
                            }`}
                          >
                            <Icon size={14} className={isActive ? 'text-[#ffffff]' : 'text-[#0066FF]'} />
                            <span>{page.label}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Action: Updates & BlueSky */}
          <div className="hidden sm:flex items-center gap-2">
            {onOpenUpdates && (
              <motion.button
                onClick={onOpenUpdates}
                whileHover={interactiveHover}
                whileTap={interactiveTap}
                className="px-2.5 py-1 text-xs font-medium text-[#687076] hover:text-[#11181c] rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] cursor-pointer"
              >
                Changelog
              </motion.button>
            )}
            <motion.a
              href="https://bsky.app/profile/robbieandrew.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[8px] bg-[#0066FF] text-[#ffffff] shadow-xs"
            >
              <span>BlueSky</span>
              <ExternalLink size={11} />
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-[8px] text-[#687076] hover:text-[#11181c] hover:bg-[#f8f9fa]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASINGS.gentleDeceleration }}
            className="lg:hidden border-t border-[#f0f1f3] bg-[#ffffff] px-4 pt-2 pb-4 space-y-1 max-h-[80vh] overflow-y-auto"
          >
            {[...PRIMARY_PAGES, ...MORE_PAGES].map((page) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => {
                    setActivePage(page.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-[8px] text-left transition-colors ${
                    isActive
                      ? 'bg-[#0066FF] text-[#ffffff]'
                      : 'text-[#11181c] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{page.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
