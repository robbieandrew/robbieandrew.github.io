import React from 'react';
import { motion } from 'framer-motion';
import CardItem from './CardItem';
import { containerStagger, VIEWPORT_CONFIG } from '../constants/motionConfig';

export default function CardGrid({ cards, onSelectCard }) {
  if (cards.length === 0) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 py-16 text-center">
        <p className="text-base text-[#11181c] font-medium">No matching datasets found</p>
        <p className="text-xs text-[#687076] mt-1">
          Try searching for keywords like "China", "EV", "cement", "USA", or "emissions".
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <motion.div
        variants={containerStagger}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT_CONFIG}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        {cards.map((card) => (
          <CardItem key={card.id} card={card} onSelect={onSelectCard} />
        ))}
      </motion.div>
    </div>
  );
}
