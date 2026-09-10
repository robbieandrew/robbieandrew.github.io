import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EASINGS,
  VIEWPORT_CONFIG,
  interactiveHover,
  interactiveTap,
} from '../constants/motionConfig';
import { ArrowUpRight, BarChart2 } from 'lucide-react';
import { getAssetUrl } from '../utils/assetUrl';

export default function CardItem({ card, onSelect }) {
  const [imgError, setImgError] = useState(false);

  // Format title to handle CO2 subscript properly
  const renderTitle = (title) => {
    if (title.includes('CO2')) {
      const parts = title.split('CO2');
      return (
        <>
          {parts[0]}
          CO<span className="subb">2</span>
          {parts[1]}
        </>
      );
    }
    return title;
  };

  const resolvedImage = getAssetUrl(card.image);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: EASINGS.materialEntrance,
          },
        },
      }}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT_CONFIG}
      whileHover={interactiveHover}
      whileTap={interactiveTap}
      onClick={() => onSelect(card)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[12px] bg-[#f8f9fa] border border-[#f0f1f3] soft-card-shadow cursor-pointer transition-colors hover:border-[#0066FF]/20"
    >
      {/* Visual Chart Thumbnail Container */}
      <div className="relative w-full aspect-[16/10] bg-[#ffffff] border-b border-[#f0f1f3] overflow-hidden flex items-center justify-center">
        {!imgError ? (
          <img
            src={resolvedImage}
            alt={card.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[#687076]">
            <BarChart2 size={32} className="text-[#0066FF] mb-2 stroke-[1.5]" />
            <span className="text-xs font-medium">Interactive Chart Archive</span>
          </div>
        )}

        {/* Category Tag */}
        <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-medium tracking-wide bg-[#ffffff]/90 text-[#687076] border border-[#e6e8eb] rounded-[6px] backdrop-blur-xs">
          {card.category}
        </span>
      </div>

      {/* Card Content & Action Area */}
      <div className="p-4 sm:p-6 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-base font-semibold text-[#11181c] leading-snug tracking-tight">
            {renderTitle(card.title)}
          </h3>
          <p className="mt-2 text-xs text-[#687076] line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        </div>

        {/* View Action matching original aesthetic */}
        <div className="mt-4 pt-3 border-t border-[#f0f1f3] flex items-center justify-between">
          <span className="text-xs text-[#687076]">Explore dashboard</span>
          <motion.button
            type="button"
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(card);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0066FF] text-[#ffffff] text-xs font-medium shadow-xs hover:bg-[#0052cc] transition-colors cursor-pointer"
          >
            <span>View</span>
            <ArrowUpRight size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
