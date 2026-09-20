import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Search,
  Check,
  X,
  Crosshair,
  Loader2,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { LocationData, CORRIDOR_PRESET_HUBS } from './InteractiveCorridorMapPicker';
import { resolveCorridorCoordinates } from '@tradeflow/shared';

// Custom Pin Icon for Modal
const createPickerIcon = (color: string, title: string) => {
  return L.divIcon({
    className: 'custom-picker-pin',
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
          padding: 2.5px 8px;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.25);
          margin-bottom: 2px;
        ">
          ${title}
        </div>
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div style="
          width: 2.5px;
          height: 6px;
          background: ${color};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

interface MapLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'ORIGIN' | 'DESTINATION';
  initialLocation: LocationData;
  onConfirm: (loc: LocationData) => void;
}

// Controller component that handles invalidateSize, map events, and flyTo
const MapController: React.FC<{
  center: [number, number];
  onMapClick: (lat: number, lng: number) => void;
}> = ({ center, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size across multiple render frames to guarantee tiles load in modal
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);

  useEffect(() => {
    if (center[0] && center[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 8), { duration: 0.5 });
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export const MapLocationModal: React.FC<MapLocationModalProps> = ({
  isOpen,
  onClose,
  targetType,
  initialLocation,
  onConfirm,
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData>(initialLocation);
  const [searchQuery, setSearchQuery] = useState<string>(initialLocation?.address || '');
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const loc = initialLocation && initialLocation.address ? initialLocation : { address: '', lat: 0, lng: 0 };
      setCurrentLocation(loc);
      setSearchQuery(loc.address || '');
      setShowSuggestions(false);
    }
  }, [isOpen, initialLocation]);

  if (!isOpen) return null;

  const isOrigin = targetType === 'ORIGIN';
  const pinColor = isOrigin ? '#10B981' : '#0284C7';
  const targetLabel = isOrigin ? 'Origin (Pickup)' : 'Destination (Delivery)';
  const pinIcon = createPickerIcon(pinColor, targetLabel);

  const defaultCenter: [number, number] =
    currentLocation.lat && currentLocation.lng
      ? [currentLocation.lat, currentLocation.lng]
      : [9.02, 38.74]; // Addis Ababa default view

  // Search input with live geocoding & preset terminals
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);

    // Fast coordinate resolution from official corridor directory
    const resolvedHub = resolveCorridorCoordinates(query);
    setCurrentLocation((prev) => ({
      ...prev,
      address: query,
      lat: resolvedHub.lat,
      lng: resolvedHub.lng,
      hubName: resolvedHub.resolvedName,
    }));

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Fast local matches
    const localMatches = CORRIDOR_PRESET_HUBS.filter(
      (hub) =>
        hub.hubName?.toLowerCase().includes(query.toLowerCase()) ||
        hub.address.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(localMatches);
    setShowSuggestions(true);

    // Live OpenStreetMap geocoding
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

            setSuggestions((prev) => {
              const combined = [...localMatches];
              apiResults.forEach((res) => {
                if (
                  !combined.some(
                    (c) =>
                      Math.abs(c.lat - res.lat) < 0.01 && Math.abs(c.lng - res.lng) < 0.01
                  )
                ) {
                  combined.push(res);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn('Geocoding search fallback:', err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelectSuggestion = (loc: LocationData) => {
    setCurrentLocation(loc);
    setSearchQuery(loc.address);
    setShowSuggestions(false);
  };

  // Reverse Geocoding on map click
  const handleMapClick = async (lat: number, lng: number) => {
    const formattedLat = parseFloat(lat.toFixed(6));
    const formattedLng = parseFloat(lng.toFixed(6));

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
        : `Corridor Location (${formattedLat}°N, ${formattedLng}°E)`;

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
      // Fallback label
    }

    const updated: LocationData = {
      address: addressLabel,
      lat: formattedLat,
      lng: formattedLng,
      hubName: minDiff < 0.15 ? nearest.hubName : 'Selected Map Pin',
    };

    setCurrentLocation(updated);
    setSearchQuery(addressLabel);
  };

  const handleSave = () => {
    const rawAddr = searchQuery || currentLocation.address || 'Selected Location';
    let lat = currentLocation.lat;
    let lng = currentLocation.lng;

    // Guarantee exact coordinate resolution from official corridor network if missing
    if (!lat || !lng || (lat === 9.02 && lng === 38.74 && !rawAddr.toLowerCase().includes('addis'))) {
      const resolved = resolveCorridorCoordinates(rawAddr);
      lat = resolved.lat;
      lng = resolved.lng;
    }

    const finalLoc: LocationData = {
      address: rawAddr,
      lat,
      lng,
      hubName: currentLocation.hubName || rawAddr,
    };
    onConfirm(finalLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full my-auto flex flex-col shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh]">
        
        {/* Modal Header (Fixed at top) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
                isOrigin ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Select {isOrigin ? 'Origin (Pickup)' : 'Destination (Delivery)'} on Map
              </h3>
              <p className="text-[10.5px] text-slate-500">
                Search terminal or click map to pinpoint GPS coordinates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          
          {/* Search Bar & Preset Terminals */}
          <div className="p-3 sm:p-3.5 bg-white border-b border-slate-100 space-y-2 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search city, terminal, or address (e.g. Kaliti, Mojo, Dire Dawa, Doraleh)..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900 bg-white"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin absolute left-2.5 top-2.5" />
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              )}
            </div>

            {/* Suggestions list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-xl max-h-32 overflow-y-auto space-y-1">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{item.hubName || item.address.split(',')[0]}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{item.address}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      {item.lat.toFixed(3)}°N, {item.lng.toFixed(3)}°E
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Hub Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Terminals:
              </span>
              {CORRIDOR_PRESET_HUBS.map((hub, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSuggestion(hub)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-colors"
                >
                  {hub.hubName?.replace(' Hub', '').replace(' (Djibouti)', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Real Leaflet Map View Container with responsive height */}
          <div className="relative w-full bg-slate-100 shrink-0" style={{ height: '280px', minHeight: '260px' }}>
            
            {/* Top HUD Hint */}
            <div className="absolute top-2.5 left-2.5 z-[1000] pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md border border-slate-800">
                <Crosshair className="w-3 h-3 text-sky-400" />
                <span>Click map to pin location</span>
              </div>
            </div>

            <MapContainer
              center={defaultCenter}
              zoom={8}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
                center={defaultCenter}
                onMapClick={handleMapClick}
              />

              {currentLocation.lat !== 0 && currentLocation.lng !== 0 && (
                <Marker position={[currentLocation.lat, currentLocation.lng]} icon={pinIcon}>
                  <Popup>
                    <div className="p-1 space-y-0.5">
                      <div className="font-bold text-xs text-slate-900">{targetLabel}</div>
                      <div className="text-[11px] text-slate-600">{currentLocation.address}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        GPS: {currentLocation.lat.toFixed(5)}°N, {currentLocation.lng.toFixed(5)}°E
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

        </div>

        {/* Modal Footer (Pinned at bottom, always visible) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shrink-0">
          <div className="space-y-0.5">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              Selected Target:
            </div>
            <div className="text-xs font-bold text-slate-900 line-clamp-1">
              {searchQuery || currentLocation.address || 'Click on the map or select a hub above'}
            </div>
            {currentLocation.lat !== 0 && (
              <div className="text-[10px] font-mono text-sky-700 font-semibold">
                GPS: {currentLocation.lat.toFixed(4)}°N, {currentLocation.lng.toFixed(4)}°E
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!searchQuery && !currentLocation.address}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-40 ${
                isOrigin ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
