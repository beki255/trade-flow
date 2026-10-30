import React from 'react';
import { Route, MapPin } from 'lucide-react';
import { LocationData } from '../types';
import { resolveCorridorCoordinates, calculateCorridorRoadDistanceKm } from '@tradeflow/shared';
import { useLanguage } from '../../../context/LanguageContext';

interface RouteLocationPickerCardProps {
  originLocation: LocationData;
  setOriginLocation?: React.Dispatch<React.SetStateAction<LocationData>>;
  destinationLocation: LocationData;
  setDestinationLocation?: React.Dispatch<React.SetStateAction<LocationData>>;
  corridorDistanceKm: number;
  onOpenMapPicker?: (target: 'ORIGIN' | 'DESTINATION') => void;
  onOpenOriginPicker?: () => void;
  onOpenDestinationPicker?: () => void;
}

export const RouteLocationPickerCard: React.FC<RouteLocationPickerCardProps> = ({
  originLocation,
  setOriginLocation,
  destinationLocation,
  setDestinationLocation,
  corridorDistanceKm,
  onOpenMapPicker,
  onOpenOriginPicker,
  onOpenDestinationPicker,
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Route className="w-4 h-4 text-sky-600" />
          <span>
            {language === 'AM'
              ? 'የመነሻ እና መድረሻ መምረጫ'
              : language === 'OM'
              ? 'Filannoo Ka\'umsaa fi Ga\'umsaa'
              : 'Route Pickers (Origin & Destination)'}
          </span>
        </h3>
        {corridorDistanceKm > 0 && (
          <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-lg">
            {language === 'AM'
              ? `ርቀት፦ ${corridorDistanceKm} ኪ.ሜ`
              : language === 'OM'
              ? `Fageenya: ${corridorDistanceKm} km`
              : `Distance: ${corridorDistanceKm} km`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Input Card */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {language === 'AM'
                  ? 'መነሻ (የመጫኛ ቦታ) *'
                  : language === 'OM'
                  ? 'Ka\'umsa (Bakka Fudhatamaa) *'
                  : 'Origin (Pickup Point) *'}
              </span>
            </label>
            {originLocation.lat !== 0 && (
              <span className="text-[9.5px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shrink-0">
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
                if (setOriginLocation) {
                  setOriginLocation({
                    address: addr,
                    lat: res.lat,
                    lng: res.lng,
                    hubName: res.resolvedName,
                  });
                }
              }}
              placeholder="e.g. Debre Sina Transit Terminal, Amhara"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900 bg-white"
            />
            <button
              type="button"
              onClick={() => {
                if (onOpenMapPicker) onOpenMapPicker('ORIGIN');
                else if (onOpenOriginPicker) onOpenOriginPicker();
              }}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'AM' ? 'ካርታ ምረጥ' : language === 'OM' ? 'Kaartaa Fili' : 'Pick Map'}</span>
            </button>
          </div>
        </div>

        {/* Destination Input Card */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>
                {language === 'AM'
                  ? 'መድረሻ (የማራገፊያ ቦታ) *'
                  : language === 'OM'
                  ? 'Ga\'umsa (Bakka Geessisaa) *'
                  : 'Destination (Delivery Point) *'}
              </span>
            </label>
            {destinationLocation.lat !== 0 && (
              <span className="text-[9.5px] font-mono text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded shrink-0">
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
                if (setDestinationLocation) {
                  setDestinationLocation({
                    address: addr,
                    lat: res.lat,
                    lng: res.lng,
                    hubName: res.resolvedName,
                  });
                }
              }}
              placeholder="e.g. Debre Berhan Industrial Hub, Amhara"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-medium text-slate-900 bg-white"
            />
            <button
              type="button"
              onClick={() => {
                if (onOpenMapPicker) onOpenMapPicker('DESTINATION');
                else if (onOpenDestinationPicker) onOpenDestinationPicker();
              }}
              className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'AM' ? 'ካርታ ምረጥ' : language === 'OM' ? 'Kaartaa Fili' : 'Pick Map'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🛣️ Live Real-Time Road Distance & ETA Preview Banner */}
      {(originLocation.address || destinationLocation.address) && (
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 text-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                  {language === 'AM' ? 'የኢትዮጵያ መንገዶች ባለስልጣን ኮሪደር' : language === 'OM' ? 'Daandiiwwan Koriidaraa' : 'ERA Highway Network'}
                </span>
                <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  {language === 'AM' ? 'ትክክለኛ GPS' : language === 'OM' ? 'GPS Sirrii' : 'Exact Ground GPS'}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-emerald-700 font-semibold">
                  {originLocation.address || (language === 'AM' ? 'መነሻ ይምረጡ' : language === 'OM' ? 'Ka\'umsa Fili' : 'Select Origin')}
                </span>
                <span className="text-sky-600 font-black">➔</span>
                <span className="text-sky-700 font-semibold">
                  {destinationLocation.address || (language === 'AM' ? 'መድረሻ ይምረጡ' : language === 'OM' ? 'Ga\'umsa Fili' : 'Select Destination')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0 sm:border-l sm:border-slate-200 sm:pl-5">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {language === 'AM' ? 'የየብስ የመንገድ ርቀት' : language === 'OM' ? 'Fageenya Daandii' : 'Ground Road Distance'}
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900">
                {calculateCorridorRoadDistanceKm(
                  originLocation.address,
                  destinationLocation.address,
                  originLocation.lat || undefined,
                  originLocation.lng || undefined,
                  destinationLocation.lat || undefined,
                  destinationLocation.lng || undefined
                )} {language === 'AM' ? 'ኪ.ሜ' : 'km'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {language === 'AM' ? 'የሚፈጀው ግምታዊ ሰዓት' : language === 'OM' ? 'Yeroo Imalaa Tilmaamamaa' : 'Est. Drive Time'}
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-700">
                ~{(
                  calculateCorridorRoadDistanceKm(
                    originLocation.address,
                    destinationLocation.address,
                    originLocation.lat || undefined,
                    originLocation.lng || undefined,
                    destinationLocation.lat || undefined,
                    destinationLocation.lng || undefined
                  ) / 48
                ).toFixed(1)} {language === 'AM' ? 'ሰዓት' : language === 'OM' ? 'sa\'a' : 'hrs'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
