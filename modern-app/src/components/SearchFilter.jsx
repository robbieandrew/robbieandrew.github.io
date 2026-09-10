import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { interactiveHover, interactiveTap } from '../constants/motionConfig';

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
}) {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#687076]">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search datasets, countries, or topics..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-[#ffffff] border border-[#e6e8eb] rounded-[6px] text-[#11181c] placeholder-[#687076] focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#687076] hover:text-[#11181c]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={interactiveHover}
                whileTap={interactiveTap}
                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0066FF] text-[#ffffff]'
                    : 'bg-[#f8f9fa] text-[#687076] hover:text-[#11181c] border border-[#e6e8eb]'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
