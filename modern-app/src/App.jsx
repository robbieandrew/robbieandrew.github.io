import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SearchFilter from './components/SearchFilter';
import CardGrid from './components/CardGrid';
import PreviewModal from './components/PreviewModal';
import ChangelogModal from './components/ChangelogModal';
import Footer from './components/Footer';

// All Inner Pages
import GcbPage from './pages/GcbPage';
import CountryPage from './pages/CountryPage';
import CarsalesPage from './pages/CarsalesPage';
import TrucksalesPage from './pages/TrucksalesPage';
import IndiaPage from './pages/IndiaPage';
import ChinaPage from './pages/ChinaPage';
import UsaPage from './pages/UsaPage';
import EvNorwayPage from './pages/EvNorwayPage';
import ConsumptionPage from './pages/ConsumptionPage';
import PpmPage from './pages/PpmPage';
import CementPage from './pages/CementPage';
import OilGasPage from './pages/OilGasPage';
import PricesPage from './pages/PricesPage';
import InternationalTransportPage from './pages/InternationalTransportPage';
import NewZealandPage from './pages/NewZealandPage';
import SwedenPage from './pages/SwedenPage';
import FossilCo2Page from './pages/FossilCo2Page';
import EuPage from './pages/EuPage';
import NorwayPage from './pages/NorwayPage';
import IndonesiaPage from './pages/IndonesiaPage';
import SingaporePage from './pages/SingaporePage';
import ThailandPage from './pages/ThailandPage';

import { CARDS_DATA } from './data/cardsData';

// Route configuration mapping page IDs to primary URL paths and legacy/short aliases
export const ROUTE_CONFIG = [
  { id: 'home', path: '/', aliases: ['/index.html', ''] },
  { id: 'gcb', path: '/gcb', aliases: ['/gcb2025', '/gcb2024', '/gcb2023', '/gcb2022', '/gcb2021'] },
  { id: 'country', path: '/country', aliases: ['/countries'] },
  { id: 'carsales', path: '/carsales', aliases: ['/vehicles', '/bilsalg'] },
  { id: 'trucksales', path: '/trucksales', aliases: ['/trucks'] },
  { id: 'india', path: '/india', aliases: [] },
  { id: 'china', path: '/china', aliases: [] },
  { id: 'usa', path: '/usa', aliases: ['/us'] },
  { id: 'eu', path: '/eu', aliases: ['/europe', '/europeanunion'] },
  { id: 'norway', path: '/norway', aliases: [] },
  { id: 'ev', path: '/ev', aliases: ['/norwayev'] },
  { id: 'indonesia', path: '/indonesia', aliases: ['/idn'] },
  { id: 'singapore', path: '/singapore', aliases: ['/sgp'] },
  { id: 'thailand', path: '/thailand', aliases: ['/tha'] },
  { id: 'consumption', path: '/consumption', aliases: ['/trade'] },
  { id: 'ppm', path: '/ppm', aliases: ['/co2', '/keeling'] },
  { id: 'cement', path: '/cement', aliases: [] },
  { id: 'oilgas', path: '/oilgas', aliases: [] },
  { id: 'prices', path: '/prices', aliases: ['/commodities'] },
  { id: 'transport', path: '/transport', aliases: ['/internationaltransport', '/aviation'] },
  { id: 'newzealand', path: '/newzealand', aliases: ['/nzl', '/nz'] },
  { id: 'sweden', path: '/sweden', aliases: [] },
  { id: 'fossilco2', path: '/fossilco2', aliases: ['/extraction'] },
];

export const PAGE_TO_PATH = Object.fromEntries(
  ROUTE_CONFIG.map((r) => [r.id, r.path])
);

export function getRepoBase() {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  if (pathname.startsWith('/robbieandrew.github.io')) {
    return '/robbieandrew.github.io';
  }
  return '';
}

export function getRouteFromLocation() {
  if (typeof window === 'undefined') return 'home';

  // 1. Check URL hash (e.g. #/india, #india, #gcb)
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    let cleanHash = hash.slice(1).toLowerCase();
    if (cleanHash.startsWith('/')) cleanHash = cleanHash.slice(1);
    cleanHash = '/' + cleanHash.split('?')[0].replace(/\/$/, '');
    for (const route of ROUTE_CONFIG) {
      if (cleanHash === route.path) return route.id;
      if (route.aliases && route.aliases.includes(cleanHash)) return route.id;
      if ('/' + route.id === cleanHash) return route.id;
    }
  }

  // 2. Check query redirect from 404.html (e.g. ?p=/india or ?/india)
  const search = window.location.search;
  if (search) {
    let routeQuery = '';
    if (search.startsWith('?/')) {
      routeQuery = search.slice(1).split('&')[0];
    } else {
      const params = new URLSearchParams(search);
      routeQuery = params.get('p') || '';
    }
    if (routeQuery) {
      if (!routeQuery.startsWith('/')) routeQuery = '/' + routeQuery;
      routeQuery = routeQuery.toLowerCase().replace(/\/$/, '');
      for (const route of ROUTE_CONFIG) {
        if (routeQuery === route.path) return route.id;
        if (route.aliases && route.aliases.includes(routeQuery)) return route.id;
      }
    }
  }

  // 3. Check pathname
  const base = getRepoBase();
  let clean = window.location.pathname.toLowerCase();
  if (base && clean.startsWith(base.toLowerCase())) {
    clean = clean.slice(base.length) || '/';
  }
  clean = clean.replace(/\/$/, '') || '/';

  for (const route of ROUTE_CONFIG) {
    if (clean === route.path) return route.id;
    if (route.aliases && route.aliases.includes(clean)) return route.id;
  }

  return 'home';
}

// Map of card IDs to dedicated inner pages
const CARD_TO_PAGE_MAP = {
  gcb2025: 'gcb',
  country: 'country',
  ev: 'ev',
  india: 'india',
  ppm: 'ppm',
  oilgas: 'oilgas',
  usa: 'usa',
  carsales: 'carsales',
  trucksales: 'trucksales',
  newzealand: 'newzealand',
  consumption: 'consumption',
  eu: 'eu',
  prices: 'prices',
  china: 'china',
  norway: 'norway',
  sweden: 'sweden',
  extraction: 'fossilco2',
  cement: 'cement',
  'fossilco2-data': 'fossilco2',
  transport: 'transport',
  indonesia: 'indonesia',
  singapore: 'singapore',
  thailand: 'thailand',
};

export default function App() {
  const [activePage, setActivePage] = useState(() => getRouteFromLocation());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

  // Sync URL changes via browser Back/Forward (popstate) and hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      setActivePage(getRouteFromLocation());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Clean up redirect query parameter from 404 fallback if present
  useEffect(() => {
    const search = window.location.search;
    const base = getRepoBase();
    if (search.startsWith('?/') || search.includes('p=')) {
      const currentRouteId = getRouteFromLocation();
      const path = PAGE_TO_PATH[currentRouteId] || '/';
      const cleanPath = (base ? base : '') + (path === '/' ? '/' : path);
      try {
        window.history.replaceState({ pageId: currentRouteId }, '', cleanPath);
      } catch (e) {
        // Fallback safely if browser blocks replaceState
      }
    }
  }, []);

  // Update browser URL and state with GitHub Pages subpath and hash support
  const navigateTo = (pageId, query = '') => {
    const base = getRepoBase();
    const path = PAGE_TO_PATH[pageId] || '/';
    const fullPath = (base ? base : '') + (path === '/' ? '/' : path);
    const targetUrl = query ? `${fullPath}?${query}` : fullPath;
    try {
      if (window.location.pathname !== fullPath) {
        window.history.pushState({ pageId }, '', targetUrl);
      }
    } catch (e) {
      window.location.hash = '#' + (path === '/' ? '' : path);
    }
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract unique categories for filter pills on Home
  const categories = useMemo(() => {
    const set = new Set(CARDS_DATA.map((c) => c.category));
    return ['All', ...Array.from(set)];
  }, []);

  // Filter cards based on search query and category
  const filteredCards = useMemo(() => {
    return CARDS_DATA.filter((card) => {
      const matchesCategory =
        activeCategory === 'All' || card.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const handleSelectCard = (card) => {
    const targetPage = CARD_TO_PAGE_MAP[card.id];
    if (targetPage) {
      navigateTo(targetPage);
    } else {
      setSelectedCard(card);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#11181c] antialiased selection:bg-[#0066FF]/10 selection:text-[#0066FF]">
      {/* Sticky Modern Navbar with Inner Page Switcher */}
      <Navbar
        activePage={activePage}
        setActivePage={(pageId) => navigateTo(pageId)}
        onOpenUpdates={() => setIsUpdatesOpen(true)}
      />

      {/* Dynamic View Rendering */}
      <main className="flex-1 w-full">
        {activePage === 'home' && (
          <>
            <Header onOpenUpdates={() => setIsUpdatesOpen(true)} />
            <SearchFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={categories}
            />
            <CardGrid
              cards={filteredCards}
              onSelectCard={handleSelectCard}
            />
          </>
        )}

        {activePage === 'gcb' && <GcbPage />}
        {activePage === 'country' && (
          <CountryPage onNavigateTo={(pageId) => navigateTo(pageId)} />
        )}
        {activePage === 'carsales' && <CarsalesPage />}
        {activePage === 'trucksales' && <TrucksalesPage />}
        {activePage === 'india' && <IndiaPage />}
        {activePage === 'china' && <ChinaPage />}
        {activePage === 'usa' && <UsaPage />}
        {activePage === 'ev' && <EvNorwayPage />}
        {activePage === 'consumption' && <ConsumptionPage />}
        {activePage === 'ppm' && <PpmPage />}
        {activePage === 'cement' && <CementPage />}
        {activePage === 'oilgas' && <OilGasPage />}
        {activePage === 'prices' && <PricesPage />}
        {activePage === 'transport' && <InternationalTransportPage />}
        {activePage === 'newzealand' && <NewZealandPage />}
        {activePage === 'sweden' && <SwedenPage />}
        {activePage === 'fossilco2' && <FossilCo2Page />}
        {activePage === 'eu' && <EuPage />}
        {activePage === 'norway' && (
          <NorwayPage onNavigateEv={() => navigateTo('ev')} />
        )}
        {activePage === 'indonesia' && <IndonesiaPage />}
        {activePage === 'singapore' && <SingaporePage />}
        {activePage === 'thailand' && (
          <ThailandPage onNavigateCarsales={() => navigateTo('carsales')} />
        )}
      </main>

      {/* Interactive Exploration Modal */}
      <PreviewModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      {/* Live Pipeline Changelog Modal */}
      <ChangelogModal
        isOpen={isUpdatesOpen}
        onClose={() => setIsUpdatesOpen(false)}
      />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
