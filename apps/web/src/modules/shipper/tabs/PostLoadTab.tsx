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
  Calendar,
} from 'lucide-react';
import { LocationData, AIMatchCarrier, MatchingSLA, ShipmentItem } from '../types';
import { AIMatchingResultsCard } from '../components/AIMatchingResultsCard';
import { RouteLocationPickerCard } from '../components/RouteLocationPickerCard';
import { DynamicSpotRateCard } from '../components/DynamicSpotRateCard';
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

  // Pickup time slot selection
  const standardTimeSlots = [
    '08:00 AM - 12:00 PM (Morning)',
    '12:00 PM - 04:00 PM (Afternoon)',
    '04:00 PM - 08:00 PM (Evening)',
    '08:00 PM - 06:00 AM (Night)',
    '08:00 AM - 06:00 PM (Full Day)',
  ];

  const isCustomTime = Boolean(
    pickupTimeWindow &&
    !standardTimeSlots.includes(pickupTimeWindow) &&
    pickupTimeWindow !== ''
  );
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(isCustomTime);
  const [customStart, setCustomStart] = useState<string>('08:00');
  const [customEnd, setCustomEnd] = useState<string>('12:00');

  useEffect(() => {
    if (!pickupTimeWindow) {
      setPickupTimeWindow('08:00 AM - 12:00 PM (Morning)');
    }
    if (!pickupDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPickupDate(tomorrow.toISOString().split('T')[0]);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('shipper.postLoadTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('shipper.postLoadSubtitle')}
            </p>
          </div>

          {onNavigateConsignments && (
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
              <div className="font-extrabold text-sm">
                {language === 'AM' ? 'ጭነት በተሳካ ሁኔታ ተፈጥሯል!' : language === 'OM' ? 'Fe\'isni Milkaa\'inaan Uumameera!' : 'Consignment Created Successfully!'}
              </div>
              <p className="text-emerald-700 font-medium mt-0.5">
                {bookingOption === 'COMPETITIVE_BIDDING'
                  ? (language === 'AM'
                      ? 'ጭነትዎ ከተረጋገጡ የኮሪደር አጓጓዦች ተወዳዳሪ ዋጋዎችን ለማግኘት ተላልፏል።'
                      : language === 'OM'
                      ? 'Fe\'isni keessan dorgommii gatiif geessitoota mirkanaa\'aniif darbeera.'
                      : 'Your load has been broadcast to verified corridor transporters for competitive quotes.')
                  : (language === 'AM'
                      ? 'የ AI አዛማጅ ሞተር የተረጋገጡ አጓጓዦችን በስሌት ባገኘው ስፖት ዋጋ ደረጃ አስቀምጧል።'
                      : language === 'OM'
                      ? 'Mootorri AI geessitoota mirkanaa\'an gatii ispootiin sadarkeesseera.'
                      : 'AI matching engine has ranked verified transporters at the calculated spot rate.')}
              </p>
            </div>
          </div>
        )}

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
              <span>
                {language === 'AM' ? 'የጭነት ዝርዝር መረጃዎች' : language === 'OM' ? 'Ibsa Fe\'isaa' : 'Cargo Specifications'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'AM' ? 'የጭነት ስም / ማብራሪያ *' : language === 'OM' ? 'Mata Duree / Ibsa Fe\'isaa *' : 'Cargo Title / Description *'}
                </label>
                <input
                  type="text"
                  required
                  value={cargoName}
                  onChange={(e) => setCargoName(e.target.value)}
                  placeholder={
                    language === 'AM'
                      ? 'ለምሳሌ፡ የይርጋጨፌ ታጠበ የወጪ ቡና ደረጃ 1'
                      : language === 'OM'
                      ? 'Fkn: Buna Yirgaacaffee Qulqulluu Sadarkaa 1'
                      : 'e.g. Export Yirgacheffe Washed Coffee Grade 1'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'AM' ? 'የጭነት ምድብ *' : language === 'OM' ? 'Gosa Fe\'isaa *' : 'Cargo Category *'}
                </label>
                <select
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium bg-white text-slate-900"
                >
                  <option value="AGRICULTURAL_COFFEE">
                    {language === 'AM' ? 'ግብርና፦ የወጪ ቡና' : language === 'OM' ? 'Qonna: Buna Ergaa' : 'Agricultural: Export Coffee'}
                  </option>
                  <option value="CONTAINERIZED">
                    {language === 'AM' ? 'በኮንቴነር የታሸገ ጭነት (FCL/LCL)' : language === 'OM' ? 'Fe\'isa Konteenaraa (FCL/LCL)' : 'Containerized Freight (FCL/LCL)'}
                  </option>
                  <option value="GRAIN_BULK">
                    {language === 'AM' ? 'እህል እና የጅምላ የግብርና ጭነት' : language === 'OM' ? 'Midhaan & Fe\'isa Qonnaa Jumlaa' : 'Grain & Bulk Agricultural Cargo'}
                  </option>
                  <option value="INDUSTRIAL_MACHINERY">
                    {language === 'AM' ? 'የኢንዱስትሪ መሣሪያዎች እና ከባድ ማሽነሪዎች' : language === 'OM' ? 'Meeshaalee Warshaa & Maashinarii Gurguddoo' : 'Industrial Equipment & Heavy Machinery'}
                  </option>
                  <option value="TEXTILES_GARMENTS">
                    {language === 'AM' ? 'ጨርቃጨርቅ እና አልባሳት' : language === 'OM' ? 'Uffata & Huccuu' : 'Textiles, Garments & Apparel'}
                  </option>
                  <option value="CONSTRUCTION_MATERIALS">
                    {language === 'AM' ? 'የግንባታ ዕቃዎች እና ሲሚንቶ' : language === 'OM' ? 'Meeshaalee Ijaarsaa & Simentoo' : 'Construction Materials & Cement'}
                  </option>
                  <option value="PETROLEUM_FUEL">
                    {language === 'AM' ? 'የነዳጅ ውጤቶች እና ነዳጅ' : language === 'OM' ? 'Boba\'aa & Bu\'aalee Boba\'aa' : 'Petroleum Products & Fuel'}
                  </option>
                  <option value="PHARMACEUTICALS">
                    {language === 'AM' ? 'መድኃኒቶች እና የሕክምና መገልገያዎች' : language === 'OM' ? 'Qorichoota & Meeshaalee Yaalaa' : 'Pharmaceuticals & Medical Supplies'}
                  </option>
                  <option value="GENERAL_MERCHANDISE">
                    {language === 'AM' ? 'ጠቅላላ ንግድ ዕቃዎች' : language === 'OM' ? 'Meeshaalee Waliigalaa' : 'General Merchandise'}
                  </option>
                </select>
              </div>
            </div>

            {/* Weight and Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'AM' ? 'ክብደት (በሜትሪክ ቶን) *' : language === 'OM' ? 'Ulfaatina (Toonii) *' : 'Weight (Metric Tons) *'}
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
                  {language === 'AM' ? 'መጠን / ይዘት (m³) *' : language === 'OM' ? 'Qabiyyee (m³) *' : 'Volume (m³) *'}
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
                {language === 'AM' ? 'የማሸጊያ ዝርዝር መመሪያዎች *' : language === 'OM' ? 'Qajeelfama Qabiinsa & Saamsamaa *' : 'Packaging Specifications & Instructions *'}
              </label>
              <textarea
                rows={2}
                required
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                placeholder={
                  language === 'AM'
                    ? 'የኮንቴነር ቁጥር፣ የእርጥበት መጠን፣ የማህተም ቁጥሮች እና ልዩ ጥንቃቄዎችን ያስገቡ...'
                    : language === 'OM'
                    ? 'Lakkoofsa konteenaraa, hamma jiidhaa, lakkoofsa chaappaa fi kkf galchaa...'
                    : 'Enter container numbering, moisture thresholds, seal numbers, palletization, etc.'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* 3. Pickup Date & Special Handling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  {language === 'AM'
                    ? 'የመጫኛ ቀን እና ሰዓት *'
                    : language === 'OM'
                    ? 'Yeroo Fudhatamaa Barbaadamu *'
                    : 'Required Pickup Window *'}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === 'AM' ? 'ቀን እና ሰዓት ይምረጡ' : language === 'OM' ? 'Guyyaa fi sa\'aa filadhu' : 'Select date & slot'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Date Input with Calendar Icon */}
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-hidden text-xs font-semibold text-slate-900 bg-white"
                      title={language === 'AM' ? 'የመጫኛ ቀን' : language === 'OM' ? 'Guyyaa Fudhatamaa' : 'Pickup Date'}
                    />
                  </div>

                  {/* Time Window Dropdown Picker */}
                  <div className="relative">
                    <select
                      value={showCustomPicker ? 'CUSTOM' : (pickupTimeWindow || '08:00 AM - 12:00 PM (Morning)')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'CUSTOM') {
                          setShowCustomPicker(true);
                          setPickupTimeWindow(`${customStart} - ${customEnd}`);
                        } else {
                          setShowCustomPicker(false);
                          setPickupTimeWindow(val);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-hidden text-xs font-semibold text-slate-900 bg-white cursor-pointer"
                    >
                      <option value="08:00 AM - 12:00 PM (Morning)">
                        {language === 'AM' ? 'ጠዋት (08:00 AM - 12:00 PM)' : language === 'OM' ? 'Bariisaa (08:00 AM - 12:00 PM)' : 'Morning (08:00 AM - 12:00 PM)'}
                      </option>
                      <option value="12:00 PM - 04:00 PM (Afternoon)">
                        {language === 'AM' ? 'ከሰዓት (12:00 PM - 04:00 PM)' : language === 'OM' ? 'Waaree Booda (12:00 PM - 04:00 PM)' : 'Afternoon (12:00 PM - 04:00 PM)'}
                      </option>
                      <option value="04:00 PM - 08:00 PM (Evening)">
                        {language === 'AM' ? 'ምሽት (04:00 PM - 08:00 PM)' : language === 'OM' ? 'Galgala (04:00 PM - 08:00 PM)' : 'Evening (04:00 PM - 08:00 PM)'}
                      </option>
                      <option value="08:00 PM - 06:00 AM (Night)">
                        {language === 'AM' ? 'ሌሊት (08:00 PM - 06:00 AM)' : language === 'OM' ? 'Halkan (08:00 PM - 06:00 AM)' : 'Night (08:00 PM - 06:00 AM)'}
                      </option>
                      <option value="08:00 AM - 06:00 PM (Full Day)">
                        {language === 'AM' ? 'ሙሉ ቀን (08:00 AM - 06:00 PM)' : language === 'OM' ? 'Guyyaa Guutuu (08:00 AM - 06:00 PM)' : 'Full Day Flexible (08:00 AM - 06:00 PM)'}
                      </option>
                      <option value="CUSTOM">
                        {language === 'AM' ? 'ልዩ የሰዓት ክልል...' : language === 'OM' ? 'Sa\'aatii Biroo...' : 'Custom Time Range...'}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Custom Time Range Picker Drawer (Only shown when "Custom Time Range..." is selected) */}
                {showCustomPicker && (
                  <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[11px] font-bold text-sky-900">
                        {language === 'AM' ? 'ከ፦' : language === 'OM' ? 'Irraa:' : 'From:'}
                      </span>
                      <input
                        type="time"
                        value={customStart}
                        onChange={(e) => {
                          setCustomStart(e.target.value);
                          setPickupTimeWindow(`${e.target.value} - ${customEnd}`);
                        }}
                        className="px-2 py-1 bg-white rounded-lg border border-sky-300 text-xs font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[11px] font-bold text-sky-900">
                        {language === 'AM' ? 'እስከ፦' : language === 'OM' ? 'Hanga:' : 'To:'}
                      </span>
                      <input
                        type="time"
                        value={customEnd}
                        onChange={(e) => {
                          setCustomEnd(e.target.value);
                          setPickupTimeWindow(`${customStart} - ${e.target.value}`);
                        }}
                        className="px-2 py-1 bg-white rounded-lg border border-sky-300 text-xs font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomPicker(false);
                        setPickupTimeWindow('08:00 AM - 12:00 PM (Morning)');
                      }}
                      className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold underline px-1"
                    >
                      {language === 'AM' ? 'መደበኛ ሰዓቶች' : language === 'OM' ? 'Idilee' : 'Presets'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'AM' ? 'ልዩ የጥንቃቄ መስፈርቶች *' : language === 'OM' ? 'Ulaagaalee Of-eeggannoo Addaa *' : 'Special Handling Requirements *'}
              </label>
              <select
                value={specialHandling}
                onChange={(e) => setSpecialHandling(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium bg-white text-slate-900"
              >
                <option value="Standard Heavy Freight">
                  {language === 'AM' ? 'መደበኛ ከባድ ጭነት' : language === 'OM' ? 'Fe\'isa Ulfaataa Idilee' : 'Standard Heavy Freight'}
                </option>
                <option value="Moisture-Controlled / High-Security Escort">
                  {language === 'AM' ? 'እርጥበት የተቆጣጠረ / ከፍተኛ ጥበቃ ያለው' : language === 'OM' ? 'Jiidha To\'atame / Eegumsa Cimaa' : 'Moisture-Controlled / High-Security Escort'}
                </option>
                <option value="Refrigerated (Reefer -20°C to +4°C)">
                  {language === 'AM' ? 'ማቀዝቀዣ ያለው (Reefer -20°C እስከ +4°C)' : language === 'OM' ? 'Meeshaa Qabbaneessaa Qabu (-20°C hanga +4°C)' : 'Refrigerated (Reefer -20°C to +4°C)'}
                </option>
                <option value="Fragile / Delicate Industrial Cargo">
                  {language === 'AM' ? 'ተሰባሪ / ስስ የኢንዱስትሪ ጭነት' : language === 'OM' ? 'Fe\'isa Caccabaa / Salphaatti Miidhamu' : 'Fragile / Delicate Industrial Cargo'}
                </option>
                <option value="Hazardous Materials (HAZMAT Class 3)">
                  {language === 'AM' ? 'አደገኛ ቁሶች (HAZMAT Class 3)' : language === 'OM' ? 'Meeshaalee Balaafamaa (HAZMAT Class 3)' : 'Hazardous Materials (HAZMAT Class 3)'}
                </option>
              </select>
            </div>
          </div>

          {/* 4. REAL-TIME CORRIDOR DYNAMIC SPOT PRICING ASSISTANT */}
          <div className="pt-2">
            <DynamicSpotRateCard
              originLocation={originLocation}
              destinationLocation={destinationLocation}
              corridorDistanceKm={corridorDistanceKm}
              weightTons={weightTons}
              cargoCategory={cargoCategory}
              specialHandling={specialHandling}
              appliedBudget={targetBudget}
              onApplySpotRate={(rate) => {
                setTargetBudget(String(rate));
              }}
            />
          </div>

          {/* 5. BOOKING OPTIONS & SELECTION (Option A: Instant AI Matching vs Option B: Competitive Bidding) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'AM'
                ? 'የኮሪደር ቦታ ማስያዣ ዘዴ ይምረጡ'
                : language === 'OM'
                ? 'Mala Buufata Koriidaraa Filadhu'
                : 'Select Corridor Booking Method'}
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Instant AI Match */}
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

              {/* Option B: Competitive Bidding */}
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

          {/* TARGET BUDGET (Applies to both; required for Instant Match) */}
          <div className="space-y-4 pt-1 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('shipper.budgetLabel')} {bookingOption === 'INSTANT_MATCH' ? '*' : (language === 'AM' ? '(አማራጭ የዒላማ በጀት)' : '(Target Budget)')}
              </label>
              <input
                type="number"
                required={bookingOption === 'INSTANT_MATCH'}
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="e.g. 185000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-hidden text-xs font-medium text-slate-900"
              />
            </div>

            {/* Matching Priority Preference (Appears ONLY for AI Matching) */}
            {bookingOption === 'INSTANT_MATCH' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/80">
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
            )}
          </div>

          {/* 5. BID / OFFER VALIDITY PERIOD (Applies to both options) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {language === 'AM'
                    ? 'የጨረታ / ውል ቆይታ ጊዜ'
                    : language === 'OM'
                    ? 'Yeroo Turmaata Caalbaasii'
                    : 'Bid / Offer Validity Period'}
                </span>
              </label>
              <p className="text-[11px] text-slate-500">
                {bookingOption === 'INSTANT_MATCH'
                  ? (language === 'AM'
                      ? 'አጓጓዡ የተመደበለትን ጭነት ተቀብሎ ለማረጋገጥ የሚሰጠው የጊዜ ገደብ።'
                      : language === 'OM'
                      ? 'Yeroo geessisaan fe\'isa fudhachuuf qabu.'
                      : 'Time window for matched carrier to accept the load booking.')
                  : (language === 'AM'
                      ? 'አጓጓዦች ዋጋ የሚያቀርቡበት እና ውል የሚፀናበት የጊዜ ገደብ።'
                      : language === 'OM'
                      ? 'Yeroo dhiyeessiin gatii itti turu.'
                      : 'Window for shippers to accept or decline carrier bids.')}
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
                      ? (language === 'AM'
                          ? 'ምርጥ አጓጓዦችን በመፈለግና በማዛመድ ላይ...'
                          : language === 'OM'
                          ? 'Geessitoota filatamoo barbaadaa jira...'
                          : 'Finding & Matching Best Transporters...')
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
      </div>

      {/* AI MATCHING RESULTS PRESENTATION */}
      <AIMatchingResultsCard
        matchedTransporters={matchedTransporters}
        matchingSla={matchingSla}
        matchingPreference={activePref}
        onSelectCarrier={onSelectCarrier}
      />
    </div>
  );
};
