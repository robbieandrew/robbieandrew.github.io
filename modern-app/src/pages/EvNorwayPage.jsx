import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BatteryCharging, History, ChevronDown, ChevronUp, Download } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger, interactiveHover, interactiveTap, EASINGS } from '../constants/motionConfig';

const TIMELINE = [
  { year: '1973', text: 'Lars Ringdal, founder of plastic company Bakelittfabrikken AS in Aurskog, built his first electric car with a motor from a washing machine and a glass-fibre body.' },
  { year: '1989', text: 'Bakelittfabrikken applies for funds for a pilot study to develop an entirely Norwegian city car combining plastic production with an aluminium frame from Norsk Hydro.' },
  { year: '1990', text: 'Norway exempts electric vehicles from import tariffs. PIVCO AS (Personal Independent Vehicle Company) is founded.' },
  { year: '1993', text: 'First complete prototype tested: PIV1.' },
  { year: '1994', text: '12 PIV2s are presented at the Winter Olympics in Lillehammer, raising international interest.' },
  { year: '1995', text: 'Norway exempts electric vehicles from annual motor vehicle registration charges.' },
  { year: '1996', text: 'Charging stations installed at 13 hotels in central Oslo along with 6 petrol stations. Toll exemptions introduced.' },
  { year: '1999', text: 'Ford Motor Company acquires majority stake in PIVCO, rebranding it as Think Nordic.' },
  { year: '2001', text: 'Exemption from 25% VAT (value-added tax) for battery electric vehicles established.' },
  { year: '2005', text: 'Electric vehicles granted access to use transit bus lanes nationwide.' },
  { year: '2012', text: 'Norway reaches 10,000 electric vehicles on the road.' },
];

export default function EvNorwayPage() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Norway EV Sales and Related Data
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          Comprehensive statistics on the Norwegian passenger fleet transition, drivetrain
          breakdowns, Tesla quarterly batch cycles, and vehicle weights.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f8f9fa] border border-[#e6e8eb] text-[#11181c] font-medium cursor-pointer"
          >
            <History size={13} className="text-[#0066FF]" />
            <span>{showHistory ? 'Hide timeline' : 'Early History of Norway’s EV Policy'}</span>
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </motion.button>

          <motion.a
            href="/EV/data/bilsalg_data.csv"
            download
            whileHover={interactiveHover}
            whileTap={interactiveTap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0066FF] text-[#ffffff] font-medium shadow-xs"
          >
            <Download size={13} />
            <span>Download Norway historical sales (CSV)</span>
          </motion.a>
        </div>
      </div>

      {/* Historical Timeline Accordion */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASINGS.materialEntrance }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-[12px] bg-[#f8f9fa] border border-[#e6e8eb] soft-card-shadow space-y-4">
              <h3 className="text-sm font-bold text-[#11181c]">
                Chronology of Norwegian EV Adoption (1973–2012)
              </h3>
              <div className="space-y-2.5">
                {TIMELINE.map((item) => (
                  <div key={item.year} className="flex items-start gap-3 text-xs text-[#11181c]">
                    <span className="font-mono font-bold text-[#0066FF] w-12 shrink-0">
                      {item.year}
                    </span>
                    <span className="text-[#687076] leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts Grid */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/EV/img/bilsalg.svg"
          title="Monthly Registration Shares by Engine Type"
          subtitle="BEV, PHEV, HEV, Diesel, Petrol"
          dataPath="/EV/data/bilsalg_data.csv"
          notes="OFV / Statens vegvesen"
        />

        <ChartViewer
          src="/EV/img/bilsalg_annual.svg"
          title="Annual New Car Registrations"
          subtitle="Long-Term Trend from 1990 to Present"
          notes="OFV / Statens vegvesen"
        />

        <ChartViewer
          src="/EV/img/bilsalg_abs_3ma.svg"
          title="3-Month Moving Average (Smoothed)"
          subtitle="Filters Quarterly Tesla Delivery Batches"
          notes="Andrew, R. calculation"
        />

        <ChartViewer
          src="/EV/img/bilsalg_abs_stacked.svg"
          title="Absolute Unit Registrations (Stacked)"
          subtitle="Total Market Volume & Powertrain Mix"
          notes="OFV"
        />

        <ChartViewer
          src="/EV/img/salesbymfr.svg"
          title="Electric Car Registrations by Make"
          subtitle="Tesla, Volkswagen, Toyota, Volvo, etc."
          notes="OFV monthly registration database"
        />

        <ChartViewer
          src="/EV/img/weight_by_drivetrain_smoothed.svg"
          title="Average Curb Weight by Drivetrain"
          subtitle="Impact of Larger Batteries on Fleet Mass"
          notes="Statens vegvesen"
        />
      </motion.div>
    </div>
  );
}
