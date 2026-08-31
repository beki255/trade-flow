import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Crosshair,
  Search,
  Check,
  Route,
  Loader2,
  Compass,
} from 'lucide-react';

// Custom Leaflet DivIcon Generators (Clean, High-DPI SVGs)
const createMarkerIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        pointer-events: auto;
      ">
        <div style="
          background: #0F172A;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.2);
          margin-bottom: 3px;
        ">
          ${label}
        </div>
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          📍
        </div>
        <div style="
          width: 3px;
          height: 8px;
          background: ${color};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const originIcon = createMarkerIcon('#10B981', 'Origin (Pickup)');
const destinationIcon = createMarkerIcon('#0284C7', 'Destination (Delivery)');

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  hubName?: string;
}

interface InteractiveCorridorMapPickerProps {
  origin: LocationData;
  destination: LocationData;
  onOriginChange: (loc: LocationData) => void;
  onDestinationChange: (loc: LocationData) => void;
}

// Major Corridor Terminals (Djibouti–Addis Ababa Freight Route)
export const CORRIDOR_PRESET_HUBS: LocationData[] = [
  {
    hubName: 'Addis Ababa Kaliti Hub',
    address: 'Kaliti Inland Container Terminal, Addis Ababa, Ethiopia',
    lat: 8.9056,
    lng: 38.7612,
  },
  {
    hubName: 'Mojo Multi-Modal Dry Port',
    address: 'Mojo Dry Port Terminal & Rail Hub, Oromia, Ethiopia',
    lat: 8.5872,
    lng: 39.1245,
  },
  {
    hubName: 'Adama Freight Depot',
    address: 'Adama Logistics Corridor Depot, Adama, Ethiopia',
    lat: 8.5411,
    lng: 39.2689,
  },
  {
    hubName: 'Dire Dawa Free Trade Zone',
    address: 'Dire Dawa Dry Port & Free Trade Zone, Dire Dawa, Ethiopia',
    lat: 9.6009,
    lng: 41.8501,
  },
  {
    hubName: 'Semera Logistics Center',
    address: 'Semera Logistics & Highway Station, Afar, Ethiopia',
    lat: 11.7925,
    lng: 41.0089,
  },
  {
    hubName: 'Galafi Border Customs',
    address: 'Galafi Ethiopia-Djibouti Border Customs Checkpoint',
    lat: 11.7244,
    lng: 41.8344,
  },
  {
    hubName: 'Port of Doraleh (Djibouti)',
    address: 'Société de Gestion du Terminal de Doraleh (SGTD), Djibouti',
    lat: 11.5950,
    lng: 43.1480,
  },
];

// Helper to calculate haversine distance in km
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Map Recenter & Event Listener Component
const MapController: React.FC<{
  activeTarget: 'ORIGIN' | 'DESTINATION';
  onMapClickLocation: (lat: number, lng: number) => void;
  center: [number, number];
}> = ({ activeTarget, onMapClickLocation, center }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.0 });
  }, [center, map]);

  useMapEvents({
    click(e) {
      onMapClickLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export const InteractiveCorridorMapPicker: React.FC<InteractiveCorridorMapPickerProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
}) => {
  const [activeTarget, setActiveTarget] = useState<'ORIGIN' | 'DESTINATION'>('ORIGIN');
  const [originSearch, setOriginSearch] = useState<string>(origin.address);
  const [destinationSearch, setDestinationSearch] = useState<string>(destination.address);
  
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Sync external props to input search text
  useEffect(() => {
    setOriginSearch(origin.address);
  }, [origin.address]);

  useEffect(() => {
    setDestinationSearch(destination.address);
  }, [destination.address]);

  // Real-time Geocoding Search via OpenStreetMap Nominatim & Corridor presets
  const handleSearchInput = async (query: string, target: 'ORIGIN' | 'DESTINATION') => {
    if (target === 'ORIGIN') {
      setOriginSearch(query);
    } else {
      setDestinationSearch(query);
    }

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 1. Fast match against corridor presets
    const localMatches = CORRIDOR_PRESET_HUBS.filter(
      (hub) =>
        hub.hubName?.toLowerCase().includes(query.toLowerCase()) ||
        hub.address.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(localMatches);
    setShowSuggestions(true);

    // 2. Fetch live geocoding results from Nominatim OpenStreetMap (Debounced)
    if (query.trim().length >= 3) {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query + ', Ethiopia'
          )}&limit=5&addressdetails=1`
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const apiResults: LocationData[] = data.map((item: any) => ({
              hubName: item.name || item.display_name.split(',')[0],
              address: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }));

            // Combine unique presets and API results
            setSuggestions((prev) => {
              const combined = [...localMatches];
              apiResults.forEach((res) => {
                if (!combined.some((c) => Math.abs(c.lat - res.lat) < 0.01 && Math.abs(c.lng - res.lng) < 0.01)) {
                  combined.push(res);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn('Live geocoding fallback to presets:', err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // On selecting a suggestion
  const handleSelectLocation = (loc: LocationData) => {
    if (activeTarget === 'ORIGIN') {
      onOriginChange(loc);
      setOriginSearch(loc.address);
    } else {
      onDestinationChange(loc);
      setDestinationSearch(loc.address);
    }
    setShowSuggestions(false);
  };

  // Reverse geocoding on real map click
  const handleMapClickLocation = async (lat: number, lng: number) => {
    const formattedLat = parseFloat(lat.toFixed(6));
    const formattedLng = parseFloat(lng.toFixed(6));

    // Check closest preset
    let nearest = CORRIDOR_PRESET_HUBS[0];
    let minDiff = 9999;
    CORRIDOR_PRESET_HUBS.forEach((hub) => {
      const diff = Math.hypot(hub.lat - formattedLat, hub.lng - formattedLng);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = hub;
      }
    });

    let addressLabel =
      minDiff < 0.15
        ? `${nearest.hubName} (${formattedLat}°N, ${formattedLng}°E)`
        : `Selected Location (${formattedLat}°N, ${formattedLng}°E)`;

    // Try reverse geocoding via OSM Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formattedLat}&lon=${formattedLng}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          addressLabel = data.display_name;
        }
      }
    } catch {
      // Fallback to coordinates label
    }

    const newLoc: LocationData = {
      address: addressLabel,
      lat: formattedLat,
      lng: formattedLng,
      hubName: minDiff < 0.15 ? nearest.hubName : 'Pinned Location',
    };

    if (activeTarget === 'ORIGIN') {
      onOriginChange(newLoc);
      setOriginSearch(addressLabel);
    } else {
      onDestinationChange(newLoc);
      setDestinationSearch(addressLabel);
    }
  };

  const distanceKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const activeCenter: [number, number] =
    activeTarget === 'ORIGIN' ? [origin.lat, origin.lng] : [destination.lat, destination.lng];

  return (
    <div className="space-y-4">
      
      {/* Target Selector Tabs: Origin vs Destination */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTarget('ORIGIN')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTarget === 'ORIGIN'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
          <span>Origin (Pickup Location)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTarget('DESTINATION')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTarget === 'DESTINATION'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200 shrink-0" />
          <span>Destination (Delivery Location)</span>
        </button>
      </div>

      {/* Interactive Search with Live Auto-Geocoding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Origin Field */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Origin Address & Terminal</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              {origin.lat.toFixed(4)}°N, {origin.lng.toFixed(4)}°E
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={originSearch}
              onFocus={() => setActiveTarget('ORIGIN')}
              onChange={(e) => handleSearchInput(e.target.value, 'ORIGIN')}
              placeholder="Search origin address (e.g. Kaliti Terminal, Addis Ababa)..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900 bg-white"
            />
            {isSearching && activeTarget === 'ORIGIN' ? (
              <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin absolute left-2.5 top-2.5" />
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            )}
          </div>
        </div>

        {/* Destination Field */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Destination Address & Port</span>
            </span>
            <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
              {destination.lat.toFixed(4)}°N, {destination.lng.toFixed(4)}°E
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={destinationSearch}
              onFocus={() => setActiveTarget('DESTINATION')}
              onChange={(e) => handleSearchInput(e.target.value, 'DESTINATION')}
              placeholder="Search destination address (e.g. Port of Doraleh, Djibouti)..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900 bg-white"
            />
            {isSearching && activeTarget === 'DESTINATION' ? (
              <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin absolute left-2.5 top-2.5" />
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            )}
          </div>
        </div>

      </div>

      {/* Geocoding Auto-Suggestions List */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-1 z-30">
          <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 flex items-center justify-between">
            <span>Matched Addresses & Terminals:</span>
            <span>Click to Select & Fly Map</span>
          </div>
          {suggestions.map((loc, i) => (
            <div
              key={i}
              onClick={() => handleSelectLocation(loc)}
              className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{loc.hubName || loc.address.split(',')[0]}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{loc.address}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded shrink-0">
                {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Select Corridor Hubs */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Preset Corridor Terminals:</span>
          <span className="text-[10px] font-bold text-slate-700">Calculated Distance: {distanceKm} km</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CORRIDOR_PRESET_HUBS.map((hub, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectLocation(hub)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap transition-all flex items-center gap-1 shrink-0 shadow-xs"
            >
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{hub.hubName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* REAL LEAFLET / OPENSTREETMAP MAP CONTAINER */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner">
        
        {/* Top Info HUD Bar */}
        <div className="absolute top-2.5 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-2 shadow-md border border-slate-800">
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span>Click map to pin {activeTarget === 'ORIGIN' ? 'Origin (Green)' : 'Destination (Blue)'}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-sky-300 font-mono text-[11px] font-bold shadow-md border border-slate-800">
            Corridor Route: {distanceKm} km
          </div>
        </div>

        {/* Real Leaflet Map View */}
        <div className="w-full h-80 sm:h-96 relative z-0">
          <MapContainer
            center={[9.8, 40.5]}
            zoom={6}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            {/* OpenStreetMap Clean Road Map Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Recenter & Click Controller */}
            <MapController
              activeTarget={activeTarget}
              onMapClickLocation={handleMapClickLocation}
              center={activeCenter}
            />

            {/* Origin Marker (Green) */}
            <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="font-bold text-xs text-emerald-800">📍 Origin (Pickup Point)</div>
                  <div className="text-[11px] text-slate-700">{origin.address}</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    GPS: {origin.lat.toFixed(5)}°N, {origin.lng.toFixed(5)}°E
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Destination Marker (Blue) */}
            <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="font-bold text-xs text-sky-800">🎯 Destination (Delivery Point)</div>
                  <div className="text-[11px] text-slate-700">{destination.address}</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    GPS: {destination.lat.toFixed(5)}°N, {destination.lng.toFixed(5)}°E
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Polyline Route Connecting Origin and Destination */}
            <Polyline
              positions={[
                [origin.lat, origin.lng],
                [destination.lat, destination.lng],
              ]}
              pathOptions={{
                color: '#0284C7',
                weight: 4,
                dashArray: '8, 6',
                opacity: 0.85,
              }}
            />
          </MapContainer>
        </div>

        {/* Bottom Status Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold">Pickup:</span>
              <span className="text-slate-500 line-clamp-1">{origin.hubName || origin.address}</span>
            </div>
            <span className="text-slate-300">➔</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="font-bold">Delivery:</span>
              <span className="text-slate-500 line-clamp-1">{destination.hubName || destination.address}</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 font-bold">
            Corridor Distance: <span className="text-slate-900">{distanceKm} km</span>
          </div>
        </div>

      </div>

    </div>
  );
};
