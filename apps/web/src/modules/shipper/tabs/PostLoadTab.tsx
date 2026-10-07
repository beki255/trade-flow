import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Route,
  MapPin,
  Zap,
  Scale,
  PlusCircle,
  Package,
  Trash2,
  ExternalLink,
  Inbox,
  Clock,
  ShieldCheck,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { LocationData, AIMatchCarrier, MatchingSLA, ShipmentItem } from '../types';
import { AIMatchingResultsCard } from '../components/AIMatchingResultsCard';
import { RouteLocationPickerCard } from '../components/RouteLocationPickerCard';
import { useLanguage } from '../../../context/LanguageContext';

export type MatchingPreferenceType = 'BALANCED' | 'COST_PRIORITY' | 'SPEED_PRIORITY' | 'RELIABILITY_PRIORITY';

interface PostLoadTabProps {
  postedSuccess: boolean;
  activeShipment?: ShipmentItem | null;
  bookingOption: 'INSTANT_MATCH' | 'COMPETITIVE_BIDDING';
  setBookingOption: (val: 'INSTANT_MATCH' | 'COMPETITIVE_BIDDING') => void;
  matchingPreference?: MatchingPreferenceType;
  setMatchingPreference?: (val: MatchingPreferenceType) => void;
  validityHours?: number;
  setValidityHours?: (val: number) => void;
  cargoName: string;
  setCargoName: (val: string) => void;
  cargoCategory: string;
  setCargoCategory: (val: string) => void;
  cargoDescription: string;
  setCargoDescription: (val: string) => void;
  weightTons: string;
  setWeightTons: (val: string) => void;
  volumeM3: string;
  setVolumeM3: (val: string) => void;
  originLocation: LocationData;
  setOriginLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  destinationLocation: LocationData;
  setDestinationLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  corridorDistanceKm: number;
  pickupDate: string;
  setPickupDate: (val: string) => void;
  pickupTimeWindow: string;
  setPickupTimeWindow: (val: string) => void;
  specialHandling: string;
  setSpecialHandling: (val: string) => void;
  targetBudget: string;
  setTargetBudget: (val: string) => void;
  matchingLoading: boolean;
  matchedTransporters: AIMatchCarrier[];
  matchingSla: MatchingSLA | null;
  onOpenMapPicker: (target: 'ORIGIN' | 'DESTINATION') => void;
  onRunAIMatching: (pref?: MatchingPreferenceType) => void;
  onSubmitPostLoad: (e: React.FormEvent) => void;
  onSelectCarrier: (carrier: AIMatchCarrier) => void;
  onNavigateConsignments?: () => void;
}

export const PostLoadTab: React.FC<PostLoadTabProps> = ({
  postedSuccess,
  activeShipment,
  bookingOption,
  setBookingOption,
  matchingPreference: propMatchingPreference,
  setMatchingPreference: propSetMatchingPreference,
  validityHours: propValidityHours,
  setValidityHours: propSetValidityHours,
  cargoName,
  setCargoName,
  cargoCategory,
  setCargoCategory,
  cargoDescription,
  setCargoDescription,
  weightTons,
  setWeightTons,
  volumeM3,
  setVolumeM3,
  originLocation,
  setOriginLocation,
  destinationLocation,
  setDestinationLocation,
  corridorDistanceKm,
  pickupDate,
  setPickupDate,
  pickupTimeWindow,
  setPickupTimeWindow,
  specialHandling,
  setSpecialHandling,
  targetBudget,
  setTargetBudget,
  matchingLoading,
  matchedTransporters,
  matchingSla,
  onOpenMapPicker,
  onRunAIMatching,
  onSubmitPostLoad,
  onSelectCarrier,
  onNavigateConsignments,
}) => {
  const { t, language } = useLanguage();

  // Local state fallbacks if props not wired
  const [localPref, setLocalPref] = useState<MatchingPreferenceType>('BALANCED');
  const activePref = propMatchingPreference || localPref;
  const updatePref = (val: MatchingPreferenceType) => {
    if (propSetMatchingPreference) propSetMatchingPreference(val);
    else setLocalPref(val);
  };

  const [localValidity, setLocalValidity] = useState<number>(24);
  const activeValidity = propValidityHours !== undefined ? propValidityHours : localValidity;
  const updateValidity = (hours: number) => {
    if (propSetValidityHours) propSetValidityHours(hours);
    else setLocalValidity(hours);
  };

  const hasActiveLoad = Boolean(
    activeShipment &&
    activeShipment.status !== 'DELIVERED' &&
    activeShipment.status !== 'CANCELLED'
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {hasActiveLoad
                ? (language === 'AM' ? 'በሂደት ላይ ያለ ጭነት' : language === 'OM' ? 'Fe\'isa Hojiirra Jiru' : 'Active Consignment')
                : t('shipper.postLoadTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasActiveLoad
                ? (language === 'AM'
                    ? 'አዲስ ጭነት ለመመዝገብ አሁን ያለውን ጭነት ማጠናቀቅ ወይም መሰረዝ ያስፈልጋል።'
                    : language === 'OM'
                    ? 'Fe\'isa haaraa galchuuf kan amma jiru xumuruu qabdu.'
                    : 'Complete or cancel your current load before posting a new consignment.')
                : t('shipper.postLoadSubtitle')}
            </p>
          </div>

          {!hasActiveLoad && onNavigateConsignments && (
            <button
              type="button"
              onClick={onNavigateConsignments}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Package className="w-4 h-4 text-sky-600" />
              <span>
                {language === 'AM' ? 'የጭነት ዝርዝር ➔' : language === 'OM' ? 'Tarree Fe\'isaa ➔' : 'View My Consignments ➔'}
              </span>
            </button>
          )}
        </div>

        {postedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-extrabold text-sm">Consignment Created Successfully!</div>
              <p className="text-emerald-700 font-medium mt-0.5">
                {bookingOption === 'COMPETITIVE_BIDDING'
                  ? 'Your load has been broadcast to verified corridor transporters for competitive quotes.'
                  : 'AI matching engine has ranked verified transporters at the calculated spot rate.'}
              </p>
            </div>
          </div>
        )}

        {hasActiveLoad ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 capitalize">
                    {activeShipment?.title || (language === 'AM' ? 'ንቁ ጭነት' : 'Active Consignment')}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    ID: {activeShipment?.id}
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                {activeShipment?.status}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {language === 'AM' ? 'የኮሪደር መስመር' : language === 'OM' ? 'Daandii Koriidaraa' : 'Corridor Route'}
                </span>
                <div className="font-bold text-slate-800 mt-0.5 truncate">
                  {activeShipment?.route}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {language === 'AM' ? 'ክብደት እና በጀት' : language === 'OM' ? 'Ulfaatina fi Baajata' : 'Weight & Budget'}
                </span>
                <div className="font-bold text-slate-800 mt-0.5">
                  {activeShipment?.weight} • {activeShipment?.budget}
                </div>
              </div>
            </div>

            {onNavigateConsignments && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onNavigateConsignments}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>
                    {language === 'AM'
                      ? 'የጭነት ዝርዝር እና ዋጋዎችን እይ ➔'
                      : language === 'OM'
                      ? 'Fe\'isa fi Caalbaasii Ilaali ➔'
                      : 'View Consignment & Quotes ➔'}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmitPostLoad} className="space-y-6">
          {/* 1. ROUTE & TERMINAL SELECTION (ERA HIGHWAY CORRIDOR) */}
          <RouteLocationPickerCard
            originLocation={originLocation}
            setOriginLocation={setOriginLocation}
            destinationLocation={destinationLocation}
            setDestinationLocation={setDestinationLocation}
            corridorDistanceKm={corridorDistanceKm}
            onOpenMapPicker={onOpenMapPicker}
            onOpenOriginPicker={() => onOpenMapPicker && onOpenMapPicker('ORIGIN')}
            onOpenDestinationPicker={() => onOpenMapPicker && onOpenMapPicker('DESTINATION')}
          />

          {/* 2. CARGO DETAILS */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-600" />
              <span>Cargo Specifications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cargo Title / Description *
                </label>
                <input
                  type="text"
                  required
                  value={cargoName}
                  onChange={(e) => setCargoName(e.target.value)}
                  placeholder="e.g. Export Yirgacheffe Washed Coffee Grade 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cargo Category *
                </label>
                <select
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium bg-white text-slate-900"
                >
                  <option value="AGRICULTURAL_COFFEE">Agricultural: Export Coffee</option>
                  <option value="CONTAINERIZED">Containerized Freight (FCL/LCL)</option>
                  <option value="GRAIN_BULK">Grain & Bulk Agricultural Cargo</option>
                  <option value="INDUSTRIAL_MACHINERY">Industrial Equipment & Heavy Machinery</option>
                  <option value="TEXTILES_GARMENTS">Textiles, Garments & Apparel</option>
                  <option value="CONSTRUCTION_MATERIALS">Construction Materials & Cement</option>
                  <option value="PETROLEUM_FUEL">Petroleum Products & Fuel</option>
                  <option value="PHARMACEUTICALS">Pharmaceuticals & Medical Supplies</option>
                  <option value="GENERAL_MERCHANDISE">General Merchandise</option>
                </select>
              </div>
            </div>

            {/* Weight and Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weight (Metric Tons) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightTons}
                  onChange={(e) => setWeightTons(e.target.value)}
                  placeholder="e.g. 28.5"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Volume (m³) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={volumeM3}
                  onChange={(e) => setVolumeM3(e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Cargo Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Packaging Specifications & Instructions *
              </label>
              <textarea
                rows={2}
                required
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                placeholder="Enter container numbering, moisture thresholds, seal numbers, palletization, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* 3. Pickup Date & Special Handling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Pickup Window *
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
                />
                <input
                  type="text"
                  value={pickupTimeWindow}
                  onChange={(e) => setPickupTimeWindow(e.target.value)}
                  placeholder="e.g. 08:00 AM - 12:00 PM"
                  className="w-full sm:w-44 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Handling Requirements *
              </label>
              <select
                value={specialHandling}
                onChange={(e) => setSpecialHandling(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium bg-white text-slate-900"
              >
                <option value="Standard Heavy Freight">Standard Heavy Freight</option>
                <option value="Moisture-Controlled / High-Security Escort">Moisture-Controlled / High-Security Escort</option>
                <option value="Refrigerated (Reefer -20°C to +4°C)">Refrigerated (Reefer -20°C to +4°C)</option>
                <option value="Fragile / Delicate Industrial Cargo">Fragile / Delicate Industrial Cargo</option>
                <option value="Hazardous Materials (HAZMAT Class 3)">Hazardous Materials (HAZMAT Class 3)</option>
              </select>
            </div>
          </div>


          {/* 5. MATCHING ALGORITHM WEIGHTS PREFERENCE (BUSINESS LOGIC 5.2.1) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {language === 'AM'
                    ? 'የማዛመጃ ቅድሚያ ምርጫ'
                    : language === 'OM'
                    ? 'Filannoo Dursaa Walgitiinsaa'
                    : 'Matching Priority Preference'}
                </span>
              </label>
              <p className="text-[11px] text-slate-500 font-medium">
                {activePref === 'BALANCED' &&
                  (language === 'AM'
                    ? 'ሚዛናዊ፡ ዋጋ 35% • አስተማማኝነት 30% • ቅርበት 20% • ነዳጅ 15%'
                    : language === 'OM'
                    ? 'Madaalawaa: Gatii 35% • Amanamummaa 30% • Dhiyoo 20% • Boba\'aa 15%'
                    : 'Weights: Cost 35% • Reliability 30% • Proximity 20% • Fuel 15%')}
                {activePref === 'COST_PRIORITY' &&
                  (language === 'AM'
                    ? 'ቅናሽ ዋጋ፡ ዋጋ 55% • አስተማማኝነት 20% • ቅርበት 15% • ነዳጅ 10%'
                    : language === 'OM'
                    ? 'Gatii Xiqqaa: Gatii 55% • Amanamummaa 20% • Dhiyoo 15% • Boba\'aa 10%'
                    : 'Weights: Cost 55% • Reliability 20% • Proximity 15% • Fuel 10%')}
                {activePref === 'SPEED_PRIORITY' &&
                  (language === 'AM'
                    ? 'ፈጣን ጉዞ፡ ፍጥነት 45% • አስተማማኝነት 30% • ዋጋ 15% • ነዳጅ 10%'
                    : language === 'OM'
                    ? 'Saffisa: Saffisa 45% • Amanamummaa 30% • Gatii 15% • Boba\'aa 10%'
                    : 'Weights: Speed 45% • Reliability 30% • Cost 15% • Fuel 10%')}
                {activePref === 'RELIABILITY_PRIORITY' &&
                  (language === 'AM'
                    ? 'አስተማማኝነት፡ አስተማማኝነት 50% • ዋጋ 20% • ቅርበት 15% • ነዳጅ 15%'
                    : language === 'OM'
                    ? 'Amanamummaa: Amanamummaa 50% • Gatii 20% • Dhiyoo 15% • Boba\'aa 15%'
                    : 'Weights: Reliability 50% • Cost 20% • Proximity 15% • Fuel 15%')}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={activePref}
                onChange={(e) => updatePref(e.target.value as MatchingPreferenceType)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                <option value="BALANCED">
                  {language === 'AM' ? 'ሚዛናዊ ምርጫ' : language === 'OM' ? 'Madaalawaa' : 'Balanced Utility'}
                </option>
                <option value="COST_PRIORITY">
                  {language === 'AM' ? 'ቅናሽ ዋጋ ቅድሚያ' : language === 'OM' ? 'Gatii Dursa' : 'Cost Priority'}
                </option>
                <option value="SPEED_PRIORITY">
                  {language === 'AM' ? 'ፈጣን መድረስ ቅድሚያ' : language === 'OM' ? 'Saffisa Dursa' : 'Speed Priority'}
                </option>
                <option value="RELIABILITY_PRIORITY">
                  {language === 'AM' ? 'ከፍተኛ አስተማማኝነት' : language === 'OM' ? 'Amanamummaa Dursa' : 'Reliability Priority'}
                </option>
              </select>
            </div>
          </div>

          {/* BID VALIDITY WINDOW CONFIGURATION (Rule 5.2.3) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {language === 'AM'
                    ? 'የጨረታ ቆይታ ጊዜ'
                    : language === 'OM'
                    ? 'Yeroo Turmaata Caalbaasii'
                    : 'Bid Validity Period'}
                </span>
              </label>
              <p className="text-[11px] text-slate-500">
                {language === 'AM'
                  ? 'አጓጓዦች ዋጋ የሚያቀርቡበት እና ውል የሚፀናበት የጊዜ ገደብ።'
                  : language === 'OM'
                  ? 'Yeroo dhiyeessiin gatii itti turu.'
                  : 'Window for shippers to accept or decline carrier bids.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={activeValidity}
                onChange={(e) => updateValidity(Number(e.target.value))}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                <option value={12}>
                  {language === 'AM' ? '12 ሰዓት' : language === 'OM' ? 'Sa\'aatii 12' : '12 Hours'}
                </option>
                <option value={24}>
                  {language === 'AM' ? '24 ሰዓት (መደበኛ)' : language === 'OM' ? 'Sa\'aatii 24 (Idilee)' : '24 Hours (Default)'}
                </option>
                <option value={48}>
                  {language === 'AM' ? '48 ሰዓት' : language === 'OM' ? 'Sa\'aatii 48' : '48 Hours'}
                </option>
                <option value={72}>
                  {language === 'AM' ? '72 ሰዓት' : language === 'OM' ? 'Sa\'aatii 72' : '72 Hours'}
                </option>
              </select>
            </div>
          </div>

          {/* 6. BOOKING OPTIONS & COMPETITIVE QUORUM (BUSINESS LOGIC 5.1 & 5.2) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'AM'
                ? 'የኮሪደር ቦታ ማስያዣ ዘዴ ይምረጡ'
                : language === 'OM'
                ? 'Mala Buufata Koriidaraa Filadhu'
                : 'Select Corridor Booking Method'}
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A */}
              <div
                onClick={() => setBookingOption('INSTANT_MATCH')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  bookingOption === 'INSTANT_MATCH'
                    ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-600" />
                  <div className="text-xs font-bold text-slate-900">
                    {t('shipper.instantMatch')}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('shipper.instantMatchDesc')}
                </p>
              </div>

              {/* Option B */}
              <div
                onClick={() => setBookingOption('COMPETITIVE_BIDDING')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  bookingOption === 'COMPETITIVE_BIDDING'
                    ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-sky-600" />
                  <div className="text-xs font-bold text-slate-900">
                    {t('shipper.competitiveBidding')}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('shipper.competitiveBiddingDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Target Budget - ONLY for Option A */}
          {bookingOption === 'INSTANT_MATCH' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('shipper.budgetLabel')} *
              </label>
              <input
                type="number"
                required
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="e.g. 185000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
              />
            </div>
          )}

          {/* Form Submit & Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={matchingLoading}
              className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {bookingOption === 'INSTANT_MATCH' ? (
                <>
                  <Zap className="w-4 h-4 text-sky-200" />
                  <span>
                    {matchingLoading
                      ? 'Finding & Matching Best Transporters...'
                      : t('shipper.findCarriersBtn')}
                  </span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('shipper.submitPublishBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>

      {/* AI MATCHING RESULTS PRESENTATION */}
      {!hasActiveLoad && (
        <AIMatchingResultsCard
          matchedTransporters={matchedTransporters}
          matchingSla={matchingSla}
          matchingPreference={activePref}
          onSelectCarrier={onSelectCarrier}
        />
      )}
    </div>
  );
};
