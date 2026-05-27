import React, { useState, useEffect } from 'react';
import { useGame } from '../lib/GameContext';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

// Read Google Maps API key from multiple fallback variables as required by Google Maps Platform skill
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Pre-defined famous authentic McDonald's locations globally for offline Fallback/Demo
const FAMOUS_STORES = [
  {
    name: "McD Times Square Flagship #304",
    address: "1530 Broadway, New York, NY 10036",
    lat: 40.7580,
    lng: -73.9855
  },
  {
    name: "McD World's Largest Entertainment",
    address: "6875 Sand Lake Rd, Orlando, FL 32819",
    lat: 28.4502,
    lng: -81.4705
  },
  {
    name: "McD Rock n Roll Retro Store",
    address: "600 N Clark St, Chicago, IL 60654",
    lat: 41.8920,
    lng: -87.6321
  },
  {
    name: "McD Oldest Operating Store",
    address: "10207 Lakewood Blvd, Downey, CA 90240",
    lat: 33.9472,
    lng: -118.1181
  },
  {
    name: "McD Mountain View Center",
    address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
    lat: 37.4220,
    lng: -122.0841
  }
];

// Helper search component when MAP key is active
function LiveSearchAndMap({ onSearchComplete }: { onSearchComplete: (name: string, address: string, lat: number, lng: number) => void }) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const { state } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placesLib || !searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await placesLib.Place.searchByText({
        textQuery: `McDonalds ${searchQuery}`,
        fields: ['displayName', 'location', 'formattedAddress'],
        locationBias: map?.getCenter() || undefined,
        maxResultCount: 5,
      });

      if (response && response.places && response.places.length > 0) {
        setSearchResults(response.places);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Live place search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    const name = place.displayName || "McDonald's Store";
    const address = place.formattedAddress || "";
    const lat = place.location?.lat();
    const lng = place.location?.lng();
    if (lat !== undefined && lng !== undefined) {
      onSearchComplete(name, address, lat, lng);
      setSearchResults([]);
      setSearchQuery('');
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(15);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <form onSubmit={handleSearch} className="flex gap-1.5">
        <input 
          id="mcd-map-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH MCDONALD'S WORLDWIDE..."
          className="flex-1 px-2.5 py-1.5 border-2 border-black font-pixel text-[10px] bg-stone-50 outline-none uppercase"
        />
        <button
          id="mcd-map-search-btn"
          type="submit"
          disabled={searching}
          className="px-3 bg-primary text-white border-2 border-black text-[10px] font-headline font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-[1.5px_1.5px_0_0_#1E1B1C]"
        >
          {searching ? 'SEEKING...' : 'LOCATE'}
        </button>
      </form>

      {/* Instant Search auto suggest dropdown */}
      {searchResults.length > 0 && (
        <div className="bg-white border-4 border-black p-1 shadow-[2px_2px_0_0_#1E1B1C] flex flex-col gap-1 max-h-32 overflow-y-auto">
          {searchResults.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPlace(p)}
              className="text-left py-1 px-2 hover:bg-stone-100 font-pixel text-[9px] uppercase border-b border-stone-100 last:border-0 block w-full leading-tight truncate text-stone-700 font-bold"
            >
              ⭐ {p.displayName} — <span className="text-stone-400 font-medium">{p.formattedAddress}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestaurantLocator() {
  const { state, updateActiveRestaurant, triggerToast } = useGame();
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Synchronize or handle manual preset selection
  const handleSelectPreset = (store: typeof FAMOUS_STORES[0]) => {
    updateActiveRestaurant(store.name, store.address, store.lat, store.lng);
    setShowPresetDropdown(false);
  };

  return (
    <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
      {/* Title Header with dynamic location status */}
      <div className="flex items-center justify-between border-b-2 border-[#1E1B1C]/15 pb-2 select-none">
        <div>
          <span className="font-pixel text-[8px] text-primary font-bold uppercase leading-none block animate-pulse">
            LIVE SHIFT REGISTRY REGIST_083
          </span>
          <h3 className="font-headline font-bold text-xs text-[#1e1b1c] uppercase tracking-wide flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[#F4E700] text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              distance
            </span>
            ASSIGNED STORE LOCATION
          </h3>
        </div>
        <button
          id="toggle-selector-presets-btn"
          onClick={() => setShowPresetDropdown(!showPresetDropdown)}
          className="px-1.5 py-0.5 border-2 border-black bg-stone-50 hover:bg-[#FEF9E1] font-pixel text-[9px] uppercase font-bold tracking-wider rounded"
        >
          {showPresetDropdown ? 'CLOSE PRESETS' : 'MCD PRESETS 🍟'}
        </button>
      </div>

      {/* Preset select dropdown drop overlay */}
      {showPresetDropdown && (
        <div className="border-2 border-dashed border-primary p-2 bg-amber-50/50 flex flex-col gap-1.5">
          <span className="font-pixel text-[8px] text-[#666000] font-bold uppercase block">
            SELECT A CERTIFIED MCD RETRO OUTLET:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {FAMOUS_STORES.map((store, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(store)}
                className="text-left p-1.5 border border-black bg-white hover:bg-yellow-100 font-pixel text-[9px] leading-tight uppercase truncate"
              >
                🏁 {store.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Selection details */}
      <div className="bg-[#FEF9E1]/40 border-2 border-black p-2.5 flex items-start gap-2.5 select-none">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
          storefront
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-bold text-xs uppercase leading-none text-stone-900 truncate">
            {state.activeRestaurantName}
          </h4>
          <p className="font-body text-[10px] text-stone-500 font-medium leading-relaxed mt-1 truncate lowercase">
            {state.activeRestaurantAddress}
          </p>
          <div className="flex gap-2 items-center mt-1">
            <span className="font-pixel text-[8px] font-semibold text-stone-400 uppercase">
              LAT: {state.activeRestaurantLat.toFixed(4)}
            </span>
            <span className="font-pixel text-[8px] font-semibold text-stone-400 uppercase">
              LNG: {state.activeRestaurantLng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Map Content Viewport */}
      <div className="relative">
        <div 
          id="mcd-google-map-wrapper"
          className="w-full h-44 border-4 border-black bg-stone-900 relative overflow-hidden flex items-center justify-center shadow-[inset_1.5px_1.5px_6px_rgba(0,0,0,0.5)] select-none"
        >
          {/* Retro isometric restaurant image */}
          <img 
            src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768555/Screenshot_2026-05-25_094428_xu6tjs.png"
            alt="Assigned Retro Restaurant Kitchen"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* CRT screen filters */}
          <div className="absolute inset-0 scanline pointer-events-none opacity-40" />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 border border-yellow-400 font-pixel text-[8px] text-yellow-400 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            LIVE_FEED: {state.activeRestaurantName}
          </div>

          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-yellow-400 text-black border-2 border-black font-pixel text-[8px] font-bold uppercase shadow-[1px_1px_0_0_#000]">
            STAFF COMPLEMENT: ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
}
