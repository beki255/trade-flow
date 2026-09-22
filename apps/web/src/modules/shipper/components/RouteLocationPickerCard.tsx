import React from 'react';
import { Route, MapPin } from 'lucide-react';
import { LocationData } from '../types';
import { resolveCorridorCoordinates, calculateCorridorRoadDistanceKm } from '@tradeflow/shared';

interface RouteLocationPickerCardProps {
  originLocation: LocationData;
  setOriginLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  destinationLocation: LocationData;
  setDestinationLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  corridorDistanceKm: number;
  onOpenMapPicker: (target: 'ORIGIN' | 'DESTINATION') => void;
}

export const RouteLocationPickerCard: React.FC<RouteLocationPickerCardProps> = ({
  originLocation,
  setOriginLocation,
  destinationLocation,
  setDestinationLocation,
  corridorDistanceKm,
  onOpenMapPicker,
}) => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Route className="w-4 h-4 text-sky-600" />
          <span>Route Pickers (Origin & Destination)</span>
        </h3>
        {corridorDistanceKm > 0 && (
          <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-lg">
            Distance: {corridorDistanceKm} km
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Input Card */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Origin (Pickup Point) *</span>
            </label>
            {originLocation.lat !== 0 && (
              <span className="text-[9.5px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                {originLocation.lat.toFixed(4)}°N, {originLocation.lng.toFixed(4)}°E
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              value={originLocation.address}
              onChange={(e) => {
                const addr = e.target.value;
                const res = resolveCorridorCoordinates(addr);
                setOriginLocation({
                  address: addr,
                  lat: res.lat,
                  lng: res.lng,
                  hubName: res.resolvedName,
                });
              }}
              placeholder="e.g. Debre Sina Transit Terminal, Amhara"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900 bg-white"
            />
            <button
              type="button"
              onClick={() => onOpenMapPicker('ORIGIN')}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pick Map</span>
            </button>
          </div>
        </div>

        {/* Destination Input Card */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Destination (Delivery Point) *</span>
            </label>
            {destinationLocation.lat !== 0 && (
              <span className="text-[9.5px] font-mono text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded">
                {destinationLocation.lat.toFixed(4)}°N, {destinationLocation.lng.toFixed(4)}°E
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              value={destinationLocation.address}
              onChange={(e) => {
                const addr = e.target.value;
                const res = resolveCorridorCoordinates(addr);
                setDestinationLocation({
                  address: addr,
                  lat: res.lat,
                  lng: res.lng,
                  hubName: res.resolvedName,
                });
              }}
              placeholder="e.g. Debre Berhan Industrial Hub, Amhara"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900 bg-white"
            />
            <button
              type="button"
              onClick={() => onOpenMapPicker('DESTINATION')}
              className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Pick Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🛣️ Live Real-Time Road Distance & ETA Preview Banner */}
      {(originLocation.address || destinationLocation.address) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-700/50 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-900/60 px-2 py-0.5 rounded border border-sky-700">
                  ERA Highway Road Network
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-700/60">
                  Exact Ground GPS
                </span>
              </div>
              <div className="text-xs font-bold text-slate-200 mt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-emerald-400 font-semibold">{originLocation.address || 'Select Origin'}</span>
                <span className="text-sky-400 font-black">➔</span>
                <span className="text-sky-300 font-semibold">{destinationLocation.address || 'Select Destination'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 sm:border-l sm:border-slate-700/70 sm:pl-5">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ground Road Distance</div>
              <div className="text-lg sm:text-xl font-black text-sky-400">
                {calculateCorridorRoadDistanceKm(
                  originLocation.address,
                  destinationLocation.address,
                  originLocation.lat || undefined,
                  originLocation.lng || undefined,
                  destinationLocation.lat || undefined,
                  destinationLocation.lng || undefined
                )} km
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Drive Time</div>
              <div className="text-lg sm:text-xl font-black text-emerald-400">
                ~{(
                  calculateCorridorRoadDistanceKm(
                    originLocation.address,
                    destinationLocation.address,
                    originLocation.lat || undefined,
                    originLocation.lng || undefined,
                    destinationLocation.lat || undefined,
                    destinationLocation.lng || undefined
                  ) / 48
                ).toFixed(1)} hrs
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
