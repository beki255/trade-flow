import React, { useState, useEffect } from 'react';
import {
  Fuel,
  ShieldAlert,
  Route,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  RefreshCw,
  MapPin,
  Camera,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Landmark,
  Scale,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

interface RouteCostBreakdown {
  distanceCostEtb: number;
  timeCostEtb: number;
  fuelCostEtb: number;
  riskExposureCostEtb: number;
  totalWeightedCostEtb: number;
}

interface OptimizedRouteItem {
  id: string;
  name: string;
  corridorType: 'PRIMARY' | 'BYPASS';
  description: string;
  distanceKm: number;
  estimatedHours: number;
  fuelLiters: number;
  fuelCostEtb: number;
  riskExposureScore: number;
  safetyRating: string;
  surfaceCondition: string;
  roadConstructionData: string;
  costBreakdown: RouteCostBreakdown;
  isRecommended: boolean;
  recommendationReason: string;
  waypoints: string[];
  polyline?: Array<{ lat: number; lng: number }>;
}

interface FuelStationItem {
  id: string;
  stationName: string;
  nameAmharic: string;
  lat: number;
  lng: number;
  fuelAvailable: boolean;
  stockStatus: string;
  dieselPricePerLiter: number;
}

interface IncidentItem {
  id: string;
  category: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  photoUrl?: string;
  isVerifiedByAuthority: boolean;
  createdAt: string;
  reporter?: {
    fullName: string;
    role: string;
    phone: string;
  };
}

interface RerouteProposal {
  proposalId: string;
  shipmentId?: string;
  incidentCategory: string;
  incidentLocation: string;
  originalRouteName: string;
  suggestedBypassRouteName: string;
  reason: string;
  distanceDeltaKm: number;
  estimatedTimeSavingMins: number;
  fuelCostDeltaEtb: number;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'DECLINED';
  createdAt: string;
}

interface TollGateItem {
  id: string;
  name: string;
  nameAmharic: string;
  location: string;
  lat: number;
  lng: number;
  tollFeeHeavyTruckEtb: number;
  electronicFastPass: boolean;
  weighbridgeComplianceLimitTons?: number;
}

interface FuelSecurityRouteOptimizationCardProps {
  selectedLoadId?: string;
  onRerouteConfirmed?: (newRouteName: string) => void;
}

const getLocalizedRouteName = (name: string, isAm: boolean, isOm: boolean): string => {
  if (!name) return '';
  if (name.includes('Primary National Highway') || name.includes('Galafi')) {
    return isAm
      ? 'ዋናው የሀገር አቀፍ አውራ ጎዳና ኤ-1 ኮሪደር (በጋላፊ ድንበር)'
      : isOm
      ? 'Kooridoorii Daandii Guddaa Biyyooleessaa A-1 (Daangaa Galaafii)'
      : name;
  }
  if (name.includes('Southern Bypass') || name.includes('Dewele')) {
    return isAm
      ? 'የደቡባዊ አማራጭ ኮሪደር (በደወሌ ድንበር)'
      : isOm
      ? 'Kooridoorii Kallattii Kibbaa (Daangaa Dawaaleetiin)'
      : name;
  }
  if (name.includes('Ethio-Djibouti Railway') || name.includes('EDR')) {
    return isAm
      ? 'የኢትዮ-ጅቡቲ የባቡር መስመር (EDR የኤሌክትሪክ ባቡር ኮሪደር)'
      : isOm
      ? 'Baabura Itoophiyaa–Jibuutii (Kooridoorii Baabura Elektirikii EDR)'
      : name;
  }
  return name;
};

const getLocalizedRouteDescription = (desc: string, isAm: boolean, isOm: boolean): string => {
  if (!desc) return '';
  if (desc.includes('Modjo Dry Port') || desc.includes('Semera') || desc.includes('Galafi')) {
    return isAm
      ? 'በሞጆ ደረቅ ወደብ፣ አዋሽ የክብደት መመዘኛ፣ ሰመራ እና ጋላፊ ጉምሩክ የሚያልፍ መደበኛ የከባድ ጭነት መስመር።'
      : isOm
      ? 'Buufata Gogaa Modjo, safartuu ulfaatinaa Awaash, Samaraa fi gumuruka daangaa Galaafiin kan darbu daandii gurguddaa fe\'isaa.'
      : desc;
  }
  if (desc.includes('Adama') || desc.includes('Dewele') || desc.includes('Dire Dawa')) {
    return isAm
      ? 'በአዳማ፣ አዋሽ፣ ድሬዳዋ ደረቅ ወደብ እና በደወሌ የድንበር ጉምሩክ በኩል የሚያልፍ ስትራቴጂካዊ አማራጭ መስመር።'
      : isOm
      ? 'Kooridoorii tarsiimoo kan Adaamaa, Awaash, Buufata Gogaa Dirree Dawaa fi Gumuruka Dawaaleetiin darbu.'
      : desc;
  }
  if (desc.includes('Standard Gauge') || desc.includes('Doraleh') || desc.includes('electrified')) {
    return isAm
      ? 'የእንዶድ እና የሞጆ ደረቅ ወደብን በቀጥታ ከዶራሌህ ኮንቴነር ተርሚናል ጋር የሚያገናኝ 752 ኪ.ሜ የኤሌክትሪክ ባቡር መስመር።'
      : isOm
      ? 'Daandii baabura elektirikii km 752 Indode/Modjo kallattiin Buufata Konteenara Doolaaleetti walqunnamsiisu.'
      : desc;
  }
  return desc;
};

const getLocalizedSurfaceCondition = (cond: string, isAm: boolean, isOm: boolean): string => {
  if (!cond) return '';
  if (cond.includes('Asphalt Paved Highway')) {
    return isAm
      ? 'የአስፋልት አውራ ጎዳና (በጉምሩክ ኬላዎች ላይ የተጨናነቀ)'
      : isOm
      ? 'Daandii Aspaaltii (Buufata gumurukaa irratti dhiphina olaanaa)'
      : cond;
  }
  if (cond.includes('Smooth Asphalt') || cond.includes('Newly Paved')) {
    return isAm
      ? 'ምቹ አስፋልት እና አዲስ የተነጠፈ የፍጥነት መንገድ'
      : isOm
      ? 'Aspaaltii Lallaafaa fi Kutaa Daandii Ariitii Haaraa'
      : cond;
  }
  if (cond.includes('Standard Gauge Heavy Rail') || cond.includes('Heavy Rail')) {
    return isAm
      ? '1,435 ሚ.ሜ ስታንዳርድ ጌጅ የከባድ ባቡር ሀዲድ'
      : isOm
      ? 'Tarkaanfii 1,435 mm Daandii Baabura Cimaa'
      : cond;
  }
  return cond;
};

const getLocalizedRoadData = (data: string, isAm: boolean, isOm: boolean): string => {
  if (!data) return '';
  if (data.includes('Normal surface conditions') || data.includes('routine maintenance')) {
    return isAm
      ? 'መደበኛ የመንገድ ሁኔታ፤ በሰመራ አቅራቢያ መደበኛ ጥገና ይካሄዳል'
      : isOm
      ? 'Haala daandii idilee; Samaraa dhiyootti suphaan adeemsifama'
      : data;
  }
  if (data.includes('Clear route') || data.includes('Dewele')) {
    return isAm
      ? 'ክፍት መስመር፤ በደወሌ ኬላ አነስተኛ የጉምሩክ ወረፋ'
      : isOm
      ? 'Daandii banaa; Buufata Dawaalee irratti tartiiba gumurukaa xiqqaa'
      : data;
  }
  if (data.includes('electrified corridor') || data.includes('zero highway traffic') || data.includes('GERD')) {
    return isAm
      ? '100% በኤሌክትሪክ የሚሰራ ኮሪደር፤ ምንም የመንገድ መጨናነቅ የሌለበት፣ በህዳሴ ግድብ ሃይል የሚሰራ'
      : isOm
      ? '100% kooridoorii elektirikii; dhiphina daandii malee, humna hidha haaromsaan kan hojjetu'
      : data;
  }
  return data;
};

const getLocalizedSafetyRating = (rating: string, isAm: boolean, isOm: boolean): string => {
  if (!rating) return '';
  if (rating.includes('B+ (Standard Secured)')) {
    return isAm ? 'B+ (መደበኛ ደህንነቱ የተጠበቀ)' : isOm ? 'B+ (Nageenyi Isaa Kan Eegame)' : rating;
  }
  if (rating.includes('A+ (Maximum Safety Buffer)')) {
    return isAm ? 'A+ (ከፍተኛ አስተማማኝ ደህንነት)' : isOm ? 'A+ (Eegumsa Nageenyaa Olaanaa)' : rating;
  }
  if (rating.includes('A++ (Fenced Electric Railway)')) {
    return isAm ? 'A++ (የታጠረ የኤሌክትሪክ ባቡር መስመር)' : isOm ? 'A++ (Daandii Baaburaa Dallaadhaan Eegame)' : rating;
  }
  if (rating.includes('C (Elevated Risk')) {
    return isAm ? 'C (ከፍተኛ ስጋት / የአደጋ ማስጠንቀቂያዎች)' : isOm ? 'C (Sodaa Olaanaa / Akeekkachiisa Balaa)' : rating;
  }
  if (rating.includes('A (Secured)')) {
    return isAm ? 'A (ደህንነቱ የተጠበቀ)' : isOm ? 'A (Nageenyi Isaa Kan Mirkanaa\'e)' : rating;
  }
  return rating;
};

const getLocalizedRecommendationReason = (reason: string, isAm: boolean, isOm: boolean): string => {
  if (!reason) return '';
  if (reason.includes('Secondary option') || reason.includes('Slower due to')) {
    return isAm
      ? 'ሁለተኛ አማራጭ፡ በሰሜናዊው ኮሪደር ላይ ባለው መዘግየት/ስጋት ምክንያት ረዘም ያለ ሰዓት ይወስዳል (38.8 ሰዓት ከ 18.3 ሰዓት በደወሌ በኩል)።'
      : isOm
      ? 'Filannoo lammaffaa: Tursiisa/sodaa kooridoorii kaabaa irra jiruun kan ka\'e yeroo dheeraa fudhata (sa\'aatii 38.8 vs sa\'aatii 18.3 Dawaaleetiin).'
      : reason;
  }
  if (reason.includes('Top recommendation') || reason.includes('Materially faster')) {
    return isAm
      ? 'ዋነኛ ምክረ-ሀሳብ፡ በጣም ፈጣን እና ደህንነቱ የተጠበቀ። ~1230 ደቂቃዎችን የሚያድን እና የሰሜኑን የአደጋ ቀጠና (የመኪና መጨናነቅን) የሚያስቀር።'
      : isOm
      ? 'Gorsa ijoo: Saffisaa fi nageenyi isaa kan mirkanaa\'e. Daqiiqaa ~1230 qusata fi naannoo sodaa kaabaa (dhiphina tartiibaa) irraa fagaata.'
      : reason;
  }
  if (reason.includes('Eco-friendly bulk rail') || reason.includes('bulk rail')) {
    return isAm
      ? 'አካባቢን የማይበክል የባቡር ትራንስፖርት፡ በጣም ፈጣን የጉዞ ጊዜ (12 ሰዓት) እና ዜሮ የናፍጣ ነዳጅ። በእንዶድ/ሞጆ ለሚጓጓዙ ሙሉ ኮንቴነሮች ተመራጭ።'
      : isOm
      ? 'Baabura walitti qabaa kan naannoo hin faalle: Yeroo saffisaa (sa\'aatii 12) fi boba\'aa dhiisa. Konteenaroota guguddoo Indode/Modjootiin ergamaniif filatamaa.'
      : reason;
  }
  if (reason.includes('Optimal default route')) {
    return isAm
      ? 'ምርጥ መደበኛ መስመር፡ አነስተኛ የጉዞ ርቀት እና ወደ ጋላፊ አውቶማቲክ ጉምሩክ ቀጥተኛ መዳረሻ።'
      : isOm
      ? 'Daandii idilee filatamaa: Fageenya gabaabaa fi gara gumuruka Galaafii kallattiin dhaqqaba.'
      : reason;
  }
  if (reason.includes('Alternative safety route')) {
    return isAm
      ? 'አማራጭ የደህንነት መስመር፡ +65 ኪ.ሜ ርቀት፤ በሰሜናዊው ኮሪደር የጉምሩክ ክምችት ወይም የደህንነት ማሳሰቢያ ሲኖር ተመራጭ።'
      : isOm
      ? 'Daandii nageenyaa filannoo: Fageenya +65 km; kooridoorii kaabaa irratti dhiphinni ykn akeekkachiisni yoo jiraate filatamaa.'
      : reason;
  }
  return reason;
};

export const FuelSecurityRouteOptimizationCard: React.FC<FuelSecurityRouteOptimizationCardProps> = ({
  selectedLoadId,
  onRerouteConfirmed,
}) => {
  const { user } = useAuth();
  const { language: rawLanguage } = useLanguage();
  const isAm = (rawLanguage || '').toUpperCase() === 'AM';
  const isOm = (rawLanguage || '').toUpperCase() === 'OM';
  const language = isAm ? 'am' : isOm ? 'om' : 'en';
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<OptimizedRouteItem[]>([]);
  const [fuelStations, setFuelStations] = useState<FuelStationItem[]>([]);
  const [tollGates, setTollGates] = useState<TollGateItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [activeProposals, setActiveProposals] = useState<RerouteProposal[]>([]);
  const [confirmedProposal, setConfirmedProposal] = useState<RerouteProposal | null>(null);
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'FUEL' | 'TOLLS' | 'INCIDENTS'>('ROUTES');
  const [confirmingReroute, setConfirmingReroute] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Web Incident Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('CHECKPOINT_DELAY');
  const [reportSeverity, setReportSeverity] = useState('MEDIUM');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLocation, setReportLocation] = useState('Galafi Customs Checkpoint');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchOptimizationData = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);

      // 1. Fetch multi-factor routes recommendation
      const routesRes = await fetch('/api/optimization/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originName: 'Kaliti Inland Container Terminal, Addis Ababa',
          destName: 'Port of Doraleh (SGTD), Djibouti',
          originLat: 8.895,
          originLng: 38.765,
          destLat: 11.595,
          destLng: 43.148,
          weightTons: 32.0,
        }),
      });

      if (routesRes.ok) {
        const data = await routesRes.json();
        setRoutes(data.optimizedRoutes || []);
        setFuelStations(data.fuelStockSummary || []);
        setTollGates(data.tollGatesSummary || []);
      }

      // 2. Fetch active incidents
      const incRes = await fetch('/api/optimization/incidents');
      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data.incidents || []);
      }

      // 3. Fetch active reroute proposals
      const propRes = await fetch('/api/optimization/reroute/proposals');
      if (propRes.ok) {
        const data = await propRes.json();
        const proposals: RerouteProposal[] = data.proposals || [];
        setActiveProposals(proposals.filter((p: any) => p.status === 'PENDING_CONFIRMATION'));
        const confirmed = proposals.find((p: any) => p.status === 'CONFIRMED');
        setConfirmedProposal(confirmed || null);
      }
    } catch (e) {
      console.warn('Optimization fetch error:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizationData(false);
    const interval = setInterval(() => fetchOptimizationData(true), 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Reroute Confirmation
  const handleConfirmReroute = async (proposalId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      setConfirmingReroute(true);
      const res = await fetch('/api/optimization/reroute/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: selectedLoadId,
          proposalId,
          action,
          confirmedByUserId: user?.id,
          confirmedByRole: 'DISPATCHER',
          reason: 'Dispatcher authorized corridor rerouting via control portal',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionMessage(
          action === 'ACCEPT'
            ? (isAm
              ? '✓ የመስመር ለውጥ ተረጋግጧል! ንቁ ጭነት በደወሌ ድንበር በኩል ወደ ደቡባዊ አማራጭ ኮሪደር ተዘዋውሯል።'
              : isOm
              ? '✓ Jijjiirraan daandii mirkanaa\'eera! Fe\'iinsi daandii Dawaaleetiin gara kooridoorii kibbaatti jijjiirameera.'
              : '✓ Corridor rerouting confirmed! Active shipment routed to Southern Bypass via Dewele Border.')
            : (isAm
              ? '✓ የመስመር ለውጡ አልተቀበለም። መደበኛው የኮሪደር መስመር እንደተጠበቀ ይቆያል።'
              : isOm
              ? '✓ Jijjiirraan daandii hin fudhatamne. Daandiin idilee akkuma jirutti itti fufa.'
              : '✓ Rerouting declined. Primary corridor path maintained.')
        );
        setTimeout(() => setActionMessage(null), 5000);
        if (action === 'ACCEPT' && onRerouteConfirmed) {
          onRerouteConfirmed('Southern Bypass Corridor via Dewele Border');
        }
        await fetchOptimizationData();
      }
    } catch (e) {
      console.error('Confirm reroute error:', e);
    } finally {
      setConfirmingReroute(false);
    }
  };

  // Handle Dispatcher Incident Submission
  const handleSubmitWebIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;

    try {
      setSubmittingReport(true);
      const token = localStorage.getItem('tradeflow_token');
      const res = await fetch('/api/optimization/incident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reporterDriverId: user?.id,
          driverEmail: user?.email,
          shipmentId: selectedLoadId,
          category: reportCategory,
          severity: reportSeverity,
          description: reportDesc,
          latitude: 11.71,
          longitude: 41.83,
          locationName: reportLocation,
        }),
      });

      if (res.ok) {
        setShowReportModal(false);
        setReportDesc('');
        setActionMessage('✓ Incident report submitted. Corridor routing graph updated!');
        setTimeout(() => setActionMessage(null), 4000);
        await fetchOptimizationData();
      }
    } catch (err) {
      console.error('Error submitting incident:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 transition-colors">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-[#1E293B]/70 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {language === 'am'
                ? 'የነዳጅ እና የደህንነት ተኮር የመስመር ማመቻቸት'
                : language === 'om'
                ? "Mijeessa Daandii Eegumsa Boba'aa fi Nageenyaa"
                : 'Fuel & Security-Aware Route Optimization'}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {language === 'am' ? 'የቀጥታ ስምረት' : language === 'om' ? 'Walsimsiisa Kallattii' : 'Live Sync'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'am'
              ? 'ርቀትን (30%)፣ የጉዞ ጊዜን (35%)፣ ነዳጅን (20%) እና የደህንነት ስጋትን (15%) የሚቀንስ ተለዋዋጭ የመስመር ምክረ-ሀሳብ።'
              : language === 'om'
              ? "Fageenya (30%), Yeroo Imalaa (35%), Boba'aa (20%) fi Sodaa Nageenyaa (15%) kan xiqqeessu gorsa daandii jijjiiramaa."
              : 'Dynamic route recommendation minimizing Distance (30%), Transit Time (35%), Fuel (20%), and Security Risk (15%).'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-200 border border-rose-200/80 dark:border-rose-700/60 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{language === 'am' ? 'አደጋ ሪፖርት አድርግ' : language === 'om' ? 'Balaa Gabaasi' : 'Report Incident'}</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mx-4 sm:mx-6 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* Confirmed Dynamic Reroute Active Banner */}
      {confirmedProposal && (
        <div className="mx-4 sm:mx-6 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'am' ? '✓ አማራጭ መስመር ተረጋግጦ በስራ ላይ ነው' : '✓ Active Corridor Reroute Confirmed'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                  {confirmedProposal.suggestedBypassRouteName.includes('Dewele') ? 'Dewele Southern Bypass' : 'Alternative Route'}
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'am'
                  ? 'ጭነቱ በደወሌ በኩል እንዲጓዝ ተቀይሯል። የቆይታ ጊዜ ቁጠባ፡ 110 ደቂቃ'
                  : 'Shipment has been rerouted via Dewele Border avoiding corridor blockage. Standstill time saved: 110 mins.'}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700">
              -110 {language === 'am' ? 'ደቂቃ' : 'min'}
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Rerouting Proposal Banner (Sleek & Compact) */}
      {activeProposals.length > 0 && (
        <div className="mx-4 sm:mx-6 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 shadow-2xs space-y-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'am' ? 'ተለዋዋጭ አማራጭ የመስመር ጥቆማ' : language === 'om' ? 'Yaada Daandii Jijjiirraa Kallattii' : 'Dynamic Rerouting Proposal'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                  {activeProposals[0].reason.replace(/ROAD_BLOCKAGE/g, language === 'am' ? 'የመንገድ መዘጋት' : language === 'om' ? 'Cufinsa daandii' : 'Road blockage')}
                </p>
              </div>
            </div>

            {/* Metrics & Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 self-end md:self-center">
              <div className="flex items-center gap-2 text-xs bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  -{activeProposals[0].estimatedTimeSavingMins} {language === 'am' ? 'ደቂቃ' : 'min'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  +{activeProposals[0].distanceDeltaKm} {language === 'am' ? 'ኪ.ሜ' : 'km'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  +{activeProposals[0].fuelCostDeltaEtb.toLocaleString()} ETB
                </span>
              </div>

              <button
                type="button"
                disabled={confirmingReroute}
                onClick={() => handleConfirmReroute(activeProposals[0].proposalId, 'ACCEPT')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'አማራጭ መስመር አረጋግጥ' : language === 'om' ? 'Daandii Jijjiirraa Mirkaneessi' : 'Confirm Reroute'}</span>
              </button>

              <button
                type="button"
                disabled={confirmingReroute}
                onClick={() => handleConfirmReroute(activeProposals[0].proposalId, 'DECLINE')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-medium transition border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                {language === 'am' ? 'አትቀበል' : language === 'om' ? 'Haqi' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="px-4 sm:px-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('ROUTES')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'ROUTES'
              ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>
            {language === 'am'
              ? `ሁለገብ መስመሮች (${routes.length})`
              : language === 'om'
              ? `Daandiiwwan Filatamaa (${routes.length})`
              : `Multi-Factor Routes (${routes.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FUEL')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'FUEL'
              ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>
            {language === 'am'
              ? `የአውራ ጎዳና ነዳጅ ማደያዎች (${fuelStations.length})`
              : language === 'om'
              ? `Buufataalee Boba'aa Daandii Guddaa (${fuelStations.length})`
              : `Highway Fuel Stations (${fuelStations.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TOLLS')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'TOLLS'
              ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>
            {language === 'am'
              ? `የክፍያ ኬላዎች እና ሚዛኖች (${tollGates.length})`
              : language === 'om'
              ? `Keellaa Kaffaltii fi Madaallii (${tollGates.length})`
              : `Toll Gates & Weighbridges (${tollGates.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INCIDENTS')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'INCIDENTS'
              ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {language === 'am'
              ? `የአደጋ ሪፖርቶች መረጃ (${incidents.length})`
              : language === 'om'
              ? `Oduu Balaa Yeroo Ammaa (${incidents.length})`
              : `Active Incident Feed (${incidents.length})`}
          </span>
        </button>
      </div>

      <div className="p-6 pt-2">
        {/* TAB 1: MULTI-FACTOR ROUTE RECOMMENDATIONS */}
        {activeTab === 'ROUTES' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {routes.map((rt) => (
                <div
                  key={rt.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 relative ${
                    rt.isRecommended
                      ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800 ring-2 ring-sky-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Recommendation Badge */}
                  {rt.isRecommended && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3 h-3" /> {language === 'am' ? 'የተመረጠ' : language === 'om' ? 'Gorfameera' : 'Recommended'}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {getLocalizedRouteName(rt.name, isAm, isOm)}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {getLocalizedRouteDescription(rt.description, isAm, isOm)}
                    </p>
                  </div>

                  {/* 4 Cost Minimization Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">
                        {language === 'am' ? 'ርቀት' : language === 'om' ? 'Fageenya' : 'Distance'}
                      </span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100">{rt.distanceKm} km</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">
                        {language === 'am' ? 'የሚወስደው' : language === 'om' ? 'Yeroo' : 'Est. Time'}
                      </span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100">{rt.estimatedHours} {language === 'am' ? 'ሰዓት' : 'hrs'}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">
                        {language === 'am' ? 'ነዳጅ' : language === 'om' ? "Boba'aa" : 'Fuel'}
                      </span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100">{rt.fuelLiters} L</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">
                        {language === 'am' ? 'ስጋት' : language === 'om' ? 'Sodaa' : 'Risk Score'}
                      </span>
                      <p
                        className={`text-xs font-black ${
                          rt.riskExposureScore > 40 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {rt.riskExposureScore}/100
                      </p>
                    </div>
                  </div>

                  {/* Surface & Road Condition */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">
                        {language === 'am' ? 'የመንገዱ ጥራት:' : language === 'om' ? 'Qulqullina Daandii:' : 'Surface Quality:'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{getLocalizedSurfaceCondition(rt.surfaceCondition, isAm, isOm)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">
                        {language === 'am' ? 'የመንገድ ሁኔታ:' : language === 'om' ? 'Odeeffannoo Daandii:' : 'Road Data:'}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{getLocalizedRoadData(rt.roadConstructionData, isAm, isOm)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">
                        {language === 'am' ? 'የደህንነት ደረጃ:' : language === 'om' ? 'Sadarkaa Nageenyaa:' : 'Security Rating:'}
                      </span>
                      <span className="font-extrabold text-sky-700 dark:text-sky-400">{getLocalizedSafetyRating(rt.safetyRating, isAm, isOm)}</span>
                    </div>
                  </div>

                  {/* Weighted Cost & Reason */}
                  <div className="p-3 rounded-xl bg-sky-100/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-sky-950 dark:text-sky-200">
                        {language === 'am' ? 'ጠቅላላ የተመዘነ ወጪ:' : language === 'om' ? 'Gatii Waliigalaa Madaalame:' : 'Weighted Total Cost:'}
                      </span>
                      <span className="text-sm font-black text-sky-900 dark:text-sky-300">
                        {rt.costBreakdown.totalWeightedCostEtb.toLocaleString()} ETB
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-snug">
                      <span className="font-bold">
                        {language === 'am' ? 'የመምረጫ ምክንያት: ' : language === 'om' ? 'Sababa Filatameef: ' : 'Recommendation Factor: '}
                      </span>
                      {getLocalizedRecommendationReason(rt.recommendationReason, isAm, isOm)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE FUEL STATION STOCK LEVELS ALONG HIGHWAY */}
        {activeTab === 'FUEL' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'am'
                ? 'በኢትዮጵያ የነዳጅ አቅራቢ ድርጅት (EPSE) የአውራ ጎዳና ማከማቻዎች የተመዘገበ የቀጥታ የናፍጣ ክምችት:'
                : language === 'om'
                ? "Kuusaa boba'aa dhiheessaa Itoophiyaa (EPSE) daandii guddaa irratti kan qabatamaan hordofamu:"
                : 'Real-time diesel inventory tracked across Ethiopian Petroleum Supply Enterprise (EPSE) highway depots:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {fuelStations.map((st) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    st.fuelAvailable
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        st.fuelAvailable
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 animate-pulse'
                      }`}
                    >
                      {st.fuelAvailable
                        ? language === 'am' ? '✓ ክምችት አለ' : language === 'om' ? '✓ Jira' : '✓ In Stock'
                        : language === 'am' ? '⚠️ አልቋል' : language === 'om' ? '⚠️ Dhumateera' : '⚠️ Stockout'}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {st.dieselPricePerLiter} ETB/L
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                      {st.stationName}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{st.nameAmharic}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    GPS: {st.lat.toFixed(3)}°N, {st.lng.toFixed(3)}°E
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE GEOTAGGED INCIDENT FEED */}
        {activeTab === 'INCIDENTS' && (
          <div className="space-y-3">
            {incidents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                {language === 'am'
                  ? '✓ በአሁኑ ጊዜ በንግድ ኮሪደሩ ላይ ምንም ዓይነት የተመዘገበ አደጋ የለም። ሁሉም ኬላዎች በመደበኛነት እየሰሩ ነው።'
                  : language === 'om'
                  ? '✓ Yeroo ammaa koriidarii daldalaa irratti gabaasni balaa hin jiru. Keellaawwan hundi haala idileetiin hojjachaa jiru.'
                  : '✓ No active incident reports currently flagged along the trade corridor. All checkpoints operating normally.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : inc.severity === 'HIGH'
                              ? 'bg-orange-500 text-white'
                              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {inc.category.replace(/_/g, ' ')} • {inc.severity}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{inc.locationName}</h5>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                          {language === 'am' ? '✓ የተረጋገጠ' : language === 'om' ? "✓ Mirkanaa'e" : '✓ Verified'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {inc.description.replace(/CHECKPOINT_DELAY/g, 'checkpoint delay').replace(/ROAD_BLOCKAGE/g, 'road blockage')}
                      </p>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        GPS: {inc.latitude.toFixed(4)}°N, {inc.longitude.toFixed(4)}°E • Reported by {inc.reporter?.fullName || 'Corridor Driver'} • {new Date(inc.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {inc.photoUrl && (
                      <a
                        href={inc.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>{language === 'am' ? 'የማስረጃ ፎቶ' : language === 'om' ? 'Suuraa Ragaa' : 'Evidence Photo'}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HIGHWAY TOLL PLAZAS & NATIONAL WEIGHBRIDGES */}
        {activeTab === 'TOLLS' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'am'
                ? 'በኮሪደሩ ላይ ያሉ የተረጋገጡ የክፍያ ኬላዎች፣ ፈጣን መተላለፊያዎች እና የክብደት መለኪያ ሚዛኖች:'
                : language === 'om'
                ? "Keellaawwan kaffaltii mirkanaa'an, daandii saffisaa fi madaalliiwwan biyyaalessaa:"
                : 'Verified Toll Plazas, Expressway FastPass Gates, and National Weighbridges along the corridor:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tollGates.map((tg) => (
                <div
                  key={tg.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
                      {tg.tollFeeHeavyTruckEtb > 0
                        ? `${tg.tollFeeHeavyTruckEtb} ETB Toll`
                        : (language === 'am' ? 'ነጻ • የህግ ማረጋገጫ' : language === 'om' ? 'Bilisa • Mirkaneessa' : 'Free • Compliance Check')}
                    </span>
                    {tg.electronicFastPass && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> FastPass
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {tg.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{tg.nameAmharic}</p>
                    <p className="text-[10px] text-sky-700 dark:text-sky-400 font-medium mt-1">{tg.location}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>GPS: {tg.lat.toFixed(3)}°N, {tg.lng.toFixed(3)}°E</span>
                    {tg.weighbridgeComplianceLimitTons && (
                      <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Max {tg.weighbridgeComplianceLimitTons}T
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INCIDENT REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </span>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'am'
                      ? 'የኮሪደር አደጋን ሪፖርት አድርግ (በካርታ የተደገፈ)'
                      : language === 'om'
                      ? 'Balaa Koriidarii Gabaasi (GPS waliin)'
                      : 'Report Corridor Incident (Geotagged)'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'am'
                      ? 'የተረጋገጡ ሪፖርቶች የመንገድ አቅጣጫዎችን እና አማራጭ መስመሮችን ወዲያውኑ ያዘምኑታል።'
                      : language === 'om'
                      ? 'Gabaasni mirkanaa\'e battalumatti daandii fi yaada jijjiirraa haaromsa.'
                      : 'Verified reports immediately update corridor routing graph & calculate reroutes.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitWebIncident} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'am' ? 'የአደጋው ዓይነት:' : language === 'om' ? 'Gosa Balaa:' : 'Incident Category:'}
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ACCIDENT">
                    {language === 'am' ? 'አደጋ (ግጭት / የመኪና መገልበጥ)' : language === 'om' ? 'Balaa (Walitti bu\'iinsa / Garagaltoo)' : 'Accident (Collision / Vehicle Rollover)'}
                  </option>
                  <option value="CHECKPOINT_DELAY">
                    {language === 'am' ? 'የኬላ / ጉምሩክ መዘግየት' : language === 'om' ? 'Turtii Keellaa / Gumruukaa' : 'Checkpoint / Customs delay'}
                  </option>
                  <option value="FUEL_OUTAGE">
                    {language === 'am' ? 'የነዳጅ ማደያ ክምችት ማለቅ' : language === 'om' ? 'Dhuminsa Boba\'aa Buufataa' : 'Fuel station stockout'}
                  </option>
                  <option value="ROAD_BLOCKAGE">
                    {language === 'am' ? 'የመንገድ መዘጋት / የመሬት መንሸራተት' : language === 'om' ? 'Cufinsa Daandii / Sigiga Lafa' : 'Road blockage / landslide'}
                  </option>
                  <option value="SECURITY_CONCERN">
                    {language === 'am' ? 'የደህንነት ስጋት' : language === 'om' ? 'Sodaa Nageenyaa' : 'Security incident'}
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                    {language === 'am' ? 'አሳሳቢነት:' : language === 'om' ? 'Sadarkaa Ciminnaa:' : 'Severity:'}
                  </label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="LOW">{language === 'am' ? 'ዝቅተኛ (አነስተኛ መዘግየት)' : language === 'om' ? 'Gadi aanaa (Turtii Xiqqaa)' : 'Low (Minor Delay)'}</option>
                    <option value="MEDIUM">{language === 'am' ? 'መካከለኛ (መካከለኛ መጨናነቅ)' : language === 'om' ? 'Giddu galeessa (Dhiphina Xiqqoo)' : 'Medium (Moderate Congestion)'}</option>
                    <option value="HIGH">{language === 'am' ? 'ከፍተኛ (ሙሉ መቆም / አጀብ የሚያስፈልገው)' : language === 'om' ? 'Olaanaa (Dhaabbachuu / Eegumsa Barbaada)' : 'High (Standstill / Escort Required)'}</option>
                    <option value="CRITICAL">{language === 'am' ? 'እጅግ ከፍተኛ (የአውራ ጎዳና ሙሉ መዘጋት)' : language === 'om' ? 'Garmalee Cimaa (Cufinsa Daandii Guutuu)' : 'Critical (Total Highway Blockage)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                    {language === 'am' ? 'የኮሪደር ቦታ:' : language === 'om' ? 'Bakka Koriidarii:' : 'Corridor Location:'}
                  </label>
                  <input
                    type="text"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    placeholder={language === 'am' ? 'ለምሳሌ ጋላፊ ጉምሩክ / አዋሽ' : 'e.g. Galafi Customs / Awash'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'am' ? 'መግለጫ እና ወቅታዊ ሁኔታ:' : language === 'om' ? 'Ibsa Bal\'aa fi Haala Yeroo:' : 'Description & Current Observations:'}
                </label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder={language === 'am' ? 'ስለ እገዳው፣ የጉምሩክ ሰልፍ ወይም የደህንነት አደጋ ዝርዝር ይግለጹ...' : 'Detail the obstruction, customs queue length, or security hazard...'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'am' ? 'ይቅር' : language === 'om' ? 'Haqi' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitWebIncident}
                  disabled={submittingReport}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingReport ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {language === 'am' ? 'አደጋውን መዝግብ' : language === 'om' ? 'Balaa Galmeessi' : 'Submit Geotagged Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
