import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Fuel, Zap } from 'lucide-react';
import ChartViewer from '../components/ChartViewer';
import { containerStagger } from '../constants/motionConfig';

export default function PricesPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11181c]">
          Energy Commodities & Carbon Pricing
        </h1>
        <p className="text-sm text-[#687076] max-w-2xl mx-auto">
          High-frequency monitoring of fossil energy benchmarks, European carbon allowance
          quotations, regional solid fuel indices, and power generation economics.
        </p>
      </div>

      {/* Grid of Price Figures */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ChartViewer
          src="/prices/img/natgasprices.svg"
          title="Global Natural Gas Benchmark Prices"
          subtitle="TTF (Europe), Henry Hub (US), JKM (Asia)"
          notes="Market Quotations"
        />

        <ChartViewer
          src="/prices/img/crudeprices.svg"
          title="Crude Oil Prices"
          subtitle="Brent Blend & West Texas Intermediate (WTI)"
          notes="Spot Benchmarks"
        />

        <ChartViewer
          src="/EU/img/EUETS_price_weekly.svg"
          title="EU ETS Weekly Carbon Allowance Price"
          subtitle="European Union Emissions Trading System (€/tCO2)"
          notes="European Energy Exchange (EEX)"
        />

        <ChartViewer
          src="/prices/img/POL_solidfuels_CPI.svg"
          title="Poland Solid Fuels Consumer Price Index"
          subtitle="Household Heating Coal CPI"
          notes="Central Statistical Office of Poland (GUS)"
        />

        <ChartViewer
          src="/norwayforest/img/norway_timber_prices.svg"
          title="Norway Industrial Timber Prices"
          subtitle="Sawlog and Pulpwood Pricing"
          notes="Statistics Norway (SSB)"
        />

        <ChartViewer
          src="/USA/img/US_coalgas_power_prices.svg"
          title="US Coal vs Natural Gas Power Costs"
          subtitle="Relative Competitiveness in Power Dispatch"
          notes="US EIA Power Sector"
        />

        <ChartViewer
          src="/USA/img/US_annual_gas_prices_long.svg"
          title="Long-Term US Retail Gasoline Prices"
          subtitle="Historical inflation-adjusted motor fuel"
          notes="US EIA MER"
        />
      </motion.div>
    </div>
  );
}
