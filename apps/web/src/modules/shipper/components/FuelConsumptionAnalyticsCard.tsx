import React, { useState, useEffect, useMemo } from 'react';
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Truck,
  UserCheck,
  MapPin,
  Search,
  Filter,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Clock,
  Compass,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface CompletedTripFuel {
  id: string;
  shipmentCode: string;
  origin: string;
  destination: string;
  cargoTitle: string;
  weightTons?: number;
  distanceKm: number;
  truckPlate: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  estimatedLiters: number;
  actualLiters: number;
  estimatedCostEtb: number;
  actualCostEtb: number;
  savingsCostEtb: number;
  benchmarkKmL: number;
  actualKmL: number;
  variancePct: number;
  avgSpeedKmh: number;
  outlierStatus: 'POSITIVE_SAVINGS' | 'NORMAL' | 'EXCESSIVE_CONSUMPTION';
  telematicsSource: string;
  completedAt: string;
}

export interface VehicleClassEfficiency {
  vehicleClass: string;
  rawClass: string;
  count: number;
  avgKmL: number;
  benchmarkKmL: number;
  deltaPct: number;
  efficiencyRating: 'OPTIMAL' | 'BELOW_BENCHMARK';
}

export interface DriverFuelRanking {
  id: string;
  driverName: string;
  phone: string;
  plateNumber: string;
  vehicleType: string;
  avgKmL: number;
  tripsCount: number;
  safetyScore: number;
  ecoScore: number;
  efficiencyStatus: 'TOP_SAVER' | 'BALANCED' | 'EXCESSIVE_CONSUMPTION';
}

export interface CorridorSegmentAnalysis {
  segmentName: string;
  distanceKm: number;
  terrainType: string;
  elevationProfile: string;
  avgSpeedKmh: number;
  avgKmL: number;
  benchmarkKmL: number;
  fuelConsumedLiters: number;
  congestionHours: number;
  recommendation: string;
}

export interface MonthlyFuelTrend {
  month: string;
  avgKmL: number;
  totalLiters: number;
  fuelCostEtb: number;
  tripsCount: number;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'DRIVING_BEHAVIOR' | 'ROUTE_ELEVATION' | 'VEHICLE_MAINTENANCE';
  title: string;
  description: string;
  estimatedSavingsLitersMonth: number;
  estimatedMonthlySavingsEtb: number;
  impactTag: string;
  actionableAdvice: string;
}

export interface FuelAnalyticsData {
  summary: {
    totalTripsTracked: number;
    totalDistanceKm: number;
    totalEstimatedLiters: number;
    totalActualLiters: number;
    totalFuelCostEtb: number;
    averageEfficiencyKmL: number;
    corridorBenchmarkKmL: number;
    totalSavingsEtb: number;
    activeDieselPricePerLiter: number;
  };
  completedTrips: CompletedTripFuel[];
  vehicleClassBreakdown: VehicleClassEfficiency[];
  driverRankings: DriverFuelRanking[];
  corridorSegments: CorridorSegmentAnalysis[];
  monthlyTrends: MonthlyFuelTrend[];
  outliers: {
    positiveSavers: CompletedTripFuel[];
    excessiveConsumers: (CompletedTripFuel & { primaryRootCause?: string })[];
  };
  optimizationSuggestions: OptimizationSuggestion[];
}

interface FuelConsumptionAnalyticsCardProps {
  transporterId?: string;
  onRefresh?: () => void;
}

export const FuelConsumptionAnalyticsCard: React.FC<FuelConsumptionAnalyticsCardProps> = ({
  transporterId,
  onRefresh,
}) => {
  const { language: rawLanguage } = useLanguage();
  const isAm = (rawLanguage || '').toUpperCase() === 'AM';
  const isOm = (rawLanguage || '').toUpperCase() === 'OM';
  const language = isAm ? 'am' : isOm ? 'om' : 'en';
  const [data, setData] = useState<FuelAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'TRIPS' | 'BENCHMARKS' | 'SEGMENTS' | 'RECOMMENDATIONS'>('TRIPS');
  const [tripFilter, setTripFilter] = useState<'ALL' | 'POSITIVE_SAVINGS' | 'EXCESSIVE_CONSUMPTION'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('ALL');

  const fetchFuelAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = transporterId
        ? `/api/analytics/fuel/${transporterId}`
        : '/api/analytics/fuel';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load fuel analytics (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Fuel analytics fetch error:', err);
      setError(err.message || 'Unable to load fuel consumption analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelAnalytics();
    const timer = setInterval(fetchFuelAnalytics, 15000);
    return () => clearInterval(timer);
  }, [transporterId]);

  const handleManualRefresh = () => {
    fetchFuelAnalytics();
    if (onRefresh) onRefresh();
  };

  // Filtered trips list
  const filteredTrips = useMemo(() => {
    if (!data?.completedTrips) return [];
    return data.completedTrips.filter((t) => {
      const matchesFilter =
        tripFilter === 'ALL' || t.outlierStatus === tripFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.shipmentCode.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.truckPlate.toLowerCase().includes(q) ||
        t.origin.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [data?.completedTrips, tripFilter, searchQuery]);

  // Filtered suggestions
  const filteredSuggestions = useMemo(() => {
    if (!data?.optimizationSuggestions) return [];
    if (recommendationFilter === 'ALL') return data.optimizationSuggestions;
    return data.optimizationSuggestions.filter((s) => s.category === recommendationFilter);
  }, [data?.optimizationSuggestions, recommendationFilter]);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <Fuel className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-800">Processing Fuel Telematics & Trip Logs...</h3>
          <p className="text-xs text-slate-500">
            Calculating GPS speed telematics, purchase logs, and corridor efficiency benchmarks.
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-800 space-y-3">
        <div className="flex items-center gap-2 font-black text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Telematics Service Offline</span>
        </div>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          onClick={handleManualRefresh}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Sync
        </button>
      </div>
    );
  }

  const summary = data?.summary || {
    totalTripsTracked: 0,
    totalDistanceKm: 0,
    totalEstimatedLiters: 0,
    totalActualLiters: 0,
    totalFuelCostEtb: 0,
    averageEfficiencyKmL: 0,
    corridorBenchmarkKmL: 2.65,
    totalSavingsEtb: 0,
    activeDieselPricePerLiter: 82.5,
  };

  const isEfficiencyOptimal = summary.averageEfficiencyKmL >= summary.corridorBenchmarkKmL;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {language === 'am'
                ? 'የነዳጅ ፍጆታ ትንተና እና መመዘኛ'
                : language === 'om'
                ? "Xiinxala fi Madaallii Fayyadama Boba'aa"
                : 'Fuel Consumption Analytics & Benchmarking'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {language === 'am'
                ? 'በአዲስ አበባ - ጅቡቲ የጭነት ኮሪደር ላይ የጂፒኤስ ፍጥነት መረጃን ከአሽከርካሪዎች የነዳጅ ግዢ ምዝገባ ጋር በማቀናጀት የቀረበ የቴሌማቲክስ ክትትል።'
                : language === 'om'
                ? "Odeeffannoo saffisa GPS galmee boba'aa bitaa konkolaachistootaa waliin qindeessuun koriidarii Finfinnee - Jibuutii irratti kan hordofamu."
                : 'Consolidated telematics tracking combining GPS speed profiles with driver purchase logs along the Addis Ababa – Djibouti freight corridor.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                {language === 'am' ? 'የናፍጣ ዋጋ መረጃ ጠቋሚ' : language === 'om' ? 'Agarsiisa Gatii Diiizilaa' : 'Diesel Rate Index'}
              </span>
              <span className="text-sm font-extrabold text-amber-900">
                {summary.activeDieselPricePerLiter.toFixed(2)} {language === 'am' ? 'ብር / ሊትር' : 'ETB / Liter'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE METRICS KPI ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Liters Consumed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'የተጠቀመው ነዳጅ' : language === 'om' ? "Boba'aa Dhumate" : 'Fuel Consumed'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {summary.totalActualLiters.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">
              {language === 'am' ? 'ሊትር' : language === 'om' ? 'Liitirii' : 'Liters'}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>
              {language === 'am' ? 'ግምት:' : language === 'om' ? 'Tilmaama:' : 'Est:'} {summary.totalEstimatedLiters.toLocaleString()} L
            </span>
          </div>
        </div>

        {/* KPI 2: Total Fuel Cost */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'ጠቅላላ የነዳጅ ወጪ' : language === 'om' ? "Gatii Waliigalaa Boba'aa" : 'Total Fuel Cost'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="text-xs font-black">ETB</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {summary.totalFuelCostEtb.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">ETB</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'am'
              ? `በ ${summary.totalTripsTracked} የጭነት ጉዞዎች`
              : language === 'om'
              ? `Imala fe'iinsaa ${summary.totalTripsTracked} keessatti`
              : `Across ${summary.totalTripsTracked} freight trips`}
          </div>
        </div>

        {/* KPI 3: Fleet Fuel Efficiency */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'የተሽከርካሪዎች ብቃት' : language === 'om' ? "Ga'umsa Konkolaattotaa" : 'Fleet Efficiency'}
            </span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              isEfficiencyOptimal ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-xl sm:text-2xl font-black tracking-tight ${
              summary.totalTripsTracked > 0
                ? isEfficiencyOptimal ? 'text-emerald-600' : 'text-amber-600'
                : 'text-slate-400'
            }`}>
              {summary.totalTripsTracked > 0 ? summary.averageEfficiencyKmL.toFixed(2) : '—'}
            </span>
            {summary.totalTripsTracked > 0 && (
              <span className="text-xs font-bold text-slate-500">
                {language === 'am' ? 'ኪ.ሜ / ሊ' : 'km / L'}
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'am' ? 'መመዘኛ:' : language === 'om' ? 'Madaallii:' : 'Benchmark:'}{' '}
            <span className="font-bold">{summary.corridorBenchmarkKmL} {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}</span>
          </div>
        </div>

        {/* KPI 4: Total Distance Covered */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'ጠቅላላ የተጓዘው ርቀት' : language === 'om' ? 'Fageenya Waliigalaa' : 'Total Haulage'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {summary.totalDistanceKm.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">
              {language === 'am' ? 'ኪ.ሜ' : 'km'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'am' ? 'የኮሪደሩ አውራ ጎዳና ምዝገባ' : language === 'om' ? 'Galmee Daandii Koriidarii' : 'Corridor Highway Logs'}
          </div>
        </div>

        {/* KPI 5: Net Outlier Savings / Variance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'የነዳጅ ወጪ ልዩነት' : language === 'om' ? "Garaagarummaa Boba'aa" : 'Net Fuel Delta'}
            </span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              summary.totalSavingsEtb >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {summary.totalSavingsEtb >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xl sm:text-2xl font-black tracking-tight ${
              summary.totalSavingsEtb >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {summary.totalSavingsEtb >= 0 ? '+' : ''}
              {summary.totalSavingsEtb.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">ETB</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {summary.totalSavingsEtb >= 0
              ? (language === 'am' ? 'ከግምቱ የዳነ ወጪ' : language === 'om' ? 'Qusannaa Tilmaama Caalu' : 'Cost Saved vs Estimate')
              : (language === 'am' ? 'ከመነሻው በላይ የሆነ ትርፍ ወጪ' : language === 'om' ? 'Baasii Dabalataa' : 'Excess Over Baseline')}
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('TRIPS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'TRIPS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>
              {language === 'am'
                ? `የጉዞ ነዳጅ ፍጆታ ምዝገባዎች (${data?.completedTrips.length || 0})`
                : language === 'om'
                ? `Galmee Boba'aa Imalaa (${data?.completedTrips.length || 0})`
                : `Trip Consumption Logs (${data?.completedTrips.length || 0})`}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('BENCHMARKS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'BENCHMARKS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>
              {language === 'am'
                ? 'የተሽከርካሪ እና አሽከርካሪ መመዘኛዎች'
                : language === 'om'
                ? 'Madaallii Konkolaataa fi Konkolaachisaa'
                : 'Vehicle & Driver Benchmarks'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('SEGMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'SEGMENTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {language === 'am'
                ? 'የኮሪደር ክፍሎች እና የመሬት አቀማመጥ'
                : language === 'om'
                ? "Kutaalee Koriidarii fi Ol-ka'iinsa"
                : 'Corridor Segments & Elevation'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('RECOMMENDATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'RECOMMENDATIONS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'am'
                ? `የማሻሻያ ምክረ-ሀሳቦች (${data?.optimizationSuggestions.length || 0})`
                : language === 'om'
                ? `Gorsa Fooyyessa Mijeessuu (${data?.optimizationSuggestions.length || 0})`
                : `Optimization Recommendations (${data?.optimizationSuggestions.length || 0})`}
            </span>
          </button>
        </div>

        {activeSubTab === 'TRIPS' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'am' ? 'በሰሌዳ፣ በአሽከርካሪ ፈልግ...' : language === 'om' ? 'Gabatee, konkolaachisaan barbaadi...' : 'Search plate, driver...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={tripFilter}
              onChange={(e) => setTripFilter(e.target.value as any)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">
                {language === 'am' ? 'ሁሉም ጉዞዎች' : language === 'om' ? 'Imala Hunda' : 'All Trips'}
              </option>
              <option value="POSITIVE_SAVINGS">
                {language === 'am' ? 'ቆጣቢ / በዒላማው ውስጥ' : language === 'om' ? 'Qusataa / Ilaalcha Keessa' : 'Optimal / Within Target'}
              </option>
              <option value="EXCESSIVE_CONSUMPTION">
                {language === 'am' ? 'ከፍተኛ ፍጆታ / ማስተካከያ የሚሻ' : language === 'om' ? 'Fayyadama Olaanaa' : 'Excessive Consumption'}
              </option>
            </select>
          </div>
        )}
      </div>

      {/* 4. SUB-TAB VIEW CONTENT */}

      {/* VIEW 1: TRIP CONSUMPTION TRACKING */}
      {activeSubTab === 'TRIPS' && (
        <div className="space-y-4">
          {/* Outlier Quick-Comparison Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Savers Highlight */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {language === 'am'
                    ? `ምርጥ ነዳጅ ቆጣቢ ጉዞዎች (${data?.outliers.positiveSavers.length || 0})`
                    : language === 'om'
                    ? `Garaagarummaa Boba'aa Qusatan (${data?.outliers.positiveSavers.length || 0})`
                    : `Top Fuel Saving Outliers (${data?.outliers.positiveSavers.length || 0})`}
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {language === 'am' ? 'ከግምቱ በታች የቀነሰ' : language === 'om' ? 'Tilmaama Gadi' : 'Below Estimated Liters'}
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {language === 'am'
                  ? 'አሽከርካሪዎች መደበኛ የኮሪደር ፍጥነት (55–65 ኪ.ሜ/ሰ) እና የተረጋጋ የዳገት ማሽከርከር በመጠበቅ የነዳጅ ፍጆታን እስከ 8.5% የቀነሱባቸው ጉዞዎች።'
                  : language === 'om'
                  ? 'Imala konkolaachistonni saffisa dhaabbataa (55–65 km/h) eeguun gubaa diizilaa hanga 8.5%tti hir\'isan.'
                  : 'Trips where drivers maintained steady corridor cruising (55–65 km/h) and smooth elevation management, reducing diesel burn by up to 8.5%.'}
              </p>
            </div>

            {/* Excessive Consumers Highlight */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {language === 'am'
                    ? `ከፍተኛ የነዳጅ ፍጆታ የታየባቸው ጉዞዎች (${data?.outliers.excessiveConsumers.length || 0})`
                    : language === 'om'
                    ? `Fayyadama Boba'aa Olaanaa (${data?.outliers.excessiveConsumers.length || 0})`
                    : `Excessive Consumption Outliers (${data?.outliers.excessiveConsumers.length || 0})`}
                </span>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {language === 'am' ? 'ግምቱን ያለፈ' : language === 'om' ? 'Tilmaama kan Caale' : 'Exceeding Estimates'}
                </span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                {language === 'am'
                  ? 'በፍጥነት ማሽከርከር (>75 ኪ.ሜ/ሰ) ወይም በገላፊ ጉምሩክ ኬላዎች ረጅም ሰዓት ሞተር አስነስቶ በመቆም ምክንያት ከፍተኛ ፍጆታ የተመዘገበባቸው ጉዞዎች።'
                  : language === 'om'
                  ? 'Imala saffisa olaanaa (>75 km/h) ykn buufata gumrukaa Galaafiitti konkolaataa dhaabanii boba\'aa gubuun kan ka\'e baasii olaanaa fidan.'
                  : 'Corridor runs with elevated consumption caused by high expressway drag (>75 km/h) or extended stationary idling at Galafi customs holds.'}
              </p>
            </div>
          </div>

          {/* Trips Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {language === 'am'
                    ? 'የተጠናቀቁ የጭነት ጉዞዎች ቴሌማቲክስ እና የግዢ መዝገቦች'
                    : language === 'om'
                    ? 'Galmee Teelimaatiksii fi Bittaa Imala Fe\'iisaa Xumuramee'
                    : 'Completed Freight Trip Telematics & Purchase Records'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'am'
                    ? 'በጂፒኤስ የፍጥነት መረጃ እና በአሽከርካሪዎች የነዳጅ ማደያ ደረሰኞች የተረጋገጠ።'
                    : language === 'om'
                    ? 'Ragaa saffisa GPS fi nagahee boba\'aa konkolaachistootaan kan mirkanaa\'e.'
                    : 'Cross-validated against GPS telemetry speed feeds and driver fuel station vouchers.'}
                </p>
              </div>
              <div className="text-xs font-bold text-slate-500">
                {language === 'am'
                  ? `${filteredTrips.length} የተመዘገቡ ጉዞዎች እየታዩ ነው`
                  : language === 'om'
                  ? `Imala galmaa'an ${filteredTrips.length} agarsiisaa jira`
                  : `Showing ${filteredTrips.length} recorded trips`}
              </div>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Fuel className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold">
                  {language === 'am'
                    ? 'የተመረጠውን መስፈርት የሚያሟላ የተጠናቀቀ ጉዞ አልተገኘም።'
                    : language === 'om'
                    ? 'Imalli xumuramee filannoo waliin wal simu hin argamne.'
                    : 'No completed corridor trips found matching filter.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4">{language === 'am' ? 'ጭነት እና መስመር' : language === 'om' ? 'Fe\'iisa & Daandii' : 'Shipment & Route'}</th>
                      <th className="py-3.5 px-4">{language === 'am' ? 'ተሽከርካሪ እና አሽከርካሪ' : language === 'om' ? 'Konkolaataa & Konkolaachisaa' : 'Vehicle & Driver'}</th>
                      <th className="py-3.5 px-4 text-right">{language === 'am' ? 'ግምት ሊትር' : language === 'om' ? 'Tilmaama Liitirii' : 'Est. Liters'}</th>
                      <th className="py-3.5 px-4 text-right">{language === 'am' ? 'ትክክለኛ ሊትር' : language === 'om' ? 'Liitirii Qabatamaa' : 'Actual Liters'}</th>
                      <th className="py-3.5 px-4 text-right">{language === 'am' ? 'የነዳጅ ወጪ' : language === 'om' ? 'Baasii Boba\'aa' : 'Fuel Cost'}</th>
                      <th className="py-3.5 px-4 text-right">{language === 'am' ? 'ብቃት' : language === 'om' ? 'Ga\'umsa' : 'Efficiency'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'am' ? 'ልዩነት %' : language === 'om' ? 'Garaagarummaa %' : 'Variance %'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'am' ? 'የቴሌማቲክስ ምንጭ' : language === 'om' ? 'Madda Teelimaatiksii' : 'Telematics Source'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrips.map((trip) => {
                      const isSaving = trip.variancePct < 0;
                      const isExcessive = trip.variancePct > 5.0;

                      return (
                        <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Shipment & Route */}
                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-900 flex items-center gap-1.5">
                              <span>{trip.shipmentCode}</span>
                              {trip.outlierStatus === 'POSITIVE_SAVINGS' && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  {language === 'am' ? 'ምርጥ ቆጣቢ' : language === 'om' ? 'Qusataa Olaanaa' : 'Top Saver'}
                                </span>
                              )}
                              {trip.outlierStatus === 'EXCESSIVE_CONSUMPTION' && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                  {language === 'am' ? 'ከፍተኛ ፍጆታ' : language === 'om' ? 'Fayyadama Olaanaa' : 'High Burn'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                              <span>{trip.origin}</span>
                              <span className="text-slate-400">➔</span>
                              <span>{trip.destination}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {trip.distanceKm} {language === 'am' ? 'ኪ.ሜ' : 'km'} • {trip.cargoTitle} {trip.weightTons ? `(${trip.weightTons}T)` : ''}
                            </div>
                          </td>

                          {/* Vehicle & Driver */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-slate-400" />
                              <span>{trip.truckPlate}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              👤 {trip.driverName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {language === 'am' ? 'ምድብ፦' : language === 'om' ? 'Garee:' : 'Class:'} {trip.vehicleType.replace(/_/g, ' ')}
                            </div>
                          </td>

                          {/* Est Liters */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-slate-600">
                              {trip.estimatedLiters.toFixed(1)} L
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {trip.estimatedCostEtb.toLocaleString()} ETB
                            </div>
                          </td>

                          {/* Actual Liters */}
                          <td className="py-3.5 px-4 text-right">
                            <div className={`font-black ${
                              isSaving ? 'text-emerald-700' : isExcessive ? 'text-rose-700' : 'text-slate-900'
                            }`}>
                              {trip.actualLiters.toFixed(1)} L
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {language === 'am' ? 'አማካይ' : language === 'om' ? 'Giddu-galeessa' : 'Avg'} {trip.avgSpeedKmh} km/h
                            </div>
                          </td>

                          {/* Fuel Cost */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-black text-slate-900">
                              {trip.actualCostEtb.toLocaleString()} ETB
                            </div>
                            <div className={`text-[10px] font-bold ${
                              trip.savingsCostEtb >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {trip.savingsCostEtb >= 0
                                ? (language === 'am' ? 'የተቆጠበ ' : language === 'om' ? 'Qusatame ' : 'Saved ')
                                : (language === 'am' ? 'ትርፍ ' : language === 'om' ? 'Dabalata ' : 'Over ')}
                              {Math.abs(trip.savingsCostEtb).toLocaleString()} ETB
                            </div>
                          </td>

                          {/* Efficiency km/L */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-black text-slate-900">
                              {trip.actualKmL.toFixed(2)} {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {language === 'am' ? 'መመዘኛ፦' : language === 'om' ? 'Madaallii:' : 'Bench:'} {trip.benchmarkKmL} {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}
                            </div>
                          </td>

                          {/* Variance % */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-black ${
                              isSaving
                                ? 'bg-emerald-100 text-emerald-800'
                                : isExcessive
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isSaving ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {Math.abs(trip.variancePct)}%
                            </span>
                          </td>

                          {/* Telematics Source */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md block max-w-[140px] mx-auto truncate" title={trip.telematicsSource}>
                              {trip.telematicsSource}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {trip.completedAt}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: VEHICLE CLASS & DRIVER BENCHMARKS */}
      {activeSubTab === 'BENCHMARKS' && (
        <div className="space-y-6">
          {/* Vehicle Class Benchmarks */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>
                  {language === 'am'
                    ? 'የተሽከርካሪ ምድብ የነዳጅ ቅልጥፍና መመዘኛ'
                    : language === 'om'
                    ? 'Madaallii Ga\'umsa Boba\'aa Garee Konkolaattotaa'
                    : 'Vehicle Class Fuel Efficiency Benchmarking'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'የተሽከርካሪዎች አማካይ የነዳጅ ቁጠባ ከጅቡቲ ኮሪደር የምህንድስና መነሻዎች ጋር የተነጻጸረ።'
                  : language === 'om'
                  ? 'Qusannaan giddu-galeessaa boba\'aa konkolaattotaa madaallii injinarummaa koriidarii Jibuutii waliin madaalame.'
                  : 'Fleet average fuel economy compared against Djibouti corridor engineering baselines.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.vehicleClassBreakdown.map((vc) => (
                <div key={vc.rawClass} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      {vc.vehicleClass}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      vc.efficiencyRating === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {vc.efficiencyRating === 'OPTIMAL'
                        ? (language === 'am' ? 'ተመጣጣኝ ፍጆታ' : language === 'om' ? 'Fayyadama Gaarii' : 'Optimal Burn')
                        : (language === 'am' ? 'ከዒላማ በታች' : language === 'om' ? 'Ilaalcha Gadi' : 'Below Target')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">{vc.avgKmL.toFixed(2)}</span>
                      <span className="text-xs font-bold text-slate-500 ml-1">{language === 'am' ? 'ኪ.ሜ / ሊ' : 'km / L'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        {language === 'am' ? 'መመዘኛ' : language === 'om' ? 'Madaallii' : 'Benchmark'}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{vc.benchmarkKmL.toFixed(2)} {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">
                      {language === 'am' ? 'ንቁ ተሽከርካሪዎች፦ ' : language === 'om' ? 'Konkolaattota Hojiirra Jiran: ' : 'Active Trucks: '}{vc.count}
                    </span>
                    <span className={vc.deltaPct >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                      {vc.deltaPct >= 0 ? '+' : ''}{vc.deltaPct}% {language === 'am' ? 'ከመመዘኛው' : language === 'om' ? 'Madaallii Waliin' : 'vs Benchmark'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Eco-Driving Leaderboard */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'am'
                    ? 'የአሽከርካሪዎች ኢኮ-ማሽከርከር እና ነዳጅ ቆጣቢነት ደረጃ ሰሌዳ'
                    : language === 'om'
                    ? 'Gabatee Sadarkaa Konkolaachistoota Qusatoota Boba\'aa'
                    : 'Driver Eco-Driving & Fuel Economy Leaderboard'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'የአሽከርካሪዎች ደረጃ በኮሪደሩ ትክክለኛ ኪ.ሜ/ሊትር፣ የደህንነት አፈጻጸም እና የተረጋጋ ፍጥነት ላይ ተመስርቷል።'
                  : language === 'om'
                  ? 'Sadarkaan konkolaachistootaa km/L qabatamaa, nageenya fi saffisa sirrii irratti hundaa\'e.'
                  : 'Driver rankings based on actual corridor km/L, safety performance, and throttle modulation.'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">{language === 'am' ? 'ደረጃ እና አሽከርካሪ' : language === 'om' ? 'Sadarkaa & Konkolaachisaa' : 'Rank & Driver'}</th>
                    <th className="py-3 px-4">{language === 'am' ? 'የተመደበ ተሽከርካሪ' : language === 'om' ? 'Konkolaataa Ramadame' : 'Assigned Vehicle'}</th>
                    <th className="py-3 px-4 text-center">{language === 'am' ? 'የተጠናቀቁ ጉዞዎች' : language === 'om' ? 'Imala Xumurame' : 'Completed Trips'}</th>
                    <th className="py-3 px-4 text-right">{language === 'am' ? 'አማካይ ኢኮኖሚ' : language === 'om' ? 'Giddu-galeessa Ekonomii' : 'Avg Economy'}</th>
                    <th className="py-3 px-4 text-center">{language === 'am' ? 'የኢኮ ነጥብ' : language === 'om' ? 'Qabxii Ikoo' : 'Eco Score'}</th>
                    <th className="py-3 px-4 text-center">{language === 'am' ? 'የደህንነት ነጥብ' : language === 'om' ? 'Qabxii Nageenyaa' : 'Safety Score'}</th>
                    <th className="py-3 px-4 text-center">{language === 'am' ? 'የብቃት ደረጃ' : language === 'om' ? 'Sadarkaa Ga\'umsaa' : 'Efficiency Rating'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.driverRankings.map((drv, idx) => (
                    <tr key={drv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-black text-slate-900">{drv.driverName}</div>
                            <div className="text-[10px] text-slate-400">{drv.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{drv.plateNumber}</div>
                        <div className="text-[10px] text-slate-400">{drv.vehicleType.replace(/_/g, ' ')}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {drv.tripsCount}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-emerald-700 text-sm">
                          {drv.avgKmL.toFixed(2)} {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-black text-slate-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg text-xs">
                          <Zap className="w-3 h-3 text-sky-600" />
                          <span>{drv.ecoScore}/100</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-black text-slate-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{drv.safetyScore.toFixed(1)}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                          drv.efficiencyStatus === 'TOP_SAVER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : drv.efficiencyStatus === 'EXCESSIVE_CONSUMPTION'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {drv.efficiencyStatus === 'TOP_SAVER'
                            ? (language === 'am' ? '★ ምርጥ ቆጣቢ' : language === 'om' ? '★ Qusataa Olaanaa' : '★ Top Saver')
                            : drv.efficiencyStatus === 'EXCESSIVE_CONSUMPTION'
                            ? (language === 'am' ? 'ከፍተኛ ፍጆታ' : language === 'om' ? 'Fayyadama Olaanaa' : 'Excessive Burn')
                            : (language === 'am' ? 'መካከለኛ' : language === 'om' ? 'Madaalawaa' : 'Balanced')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trends Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>
                  {language === 'am'
                    ? 'የወርሃዊ ነዳጅ ፍጆታ እና ብቃት ታሪክ'
                    : language === 'om'
                    ? 'Seenaa Fayyadama Boba\'aa fi Ga\'umsa Ji\'aa'
                    : 'Monthly Fuel Consumption & Efficiency History'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'የ 6 ወራት አጠቃላይ የናፍጣ መጠን፣ ወጪዎች እና አማካይ የኮሪደር ኪ.ሜ/ሊትር።'
                  : language === 'om'
                  ? 'Hanga diizilaa, baasii fi giddu-galeessa km/L koriidarii ji\'oota 6.'
                  : '6-month rolling aggregation of diesel volume, expenditures, and average corridor km/L.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {data?.monthlyTrends.map((m) => {
                const hasTrips = m.totalLiters > 0;
                return (
                  <div key={m.month} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
                    <span className="text-xs font-black text-slate-700 uppercase">{m.month}</span>
                    <div className={`text-lg font-black ${hasTrips ? 'text-slate-900' : 'text-slate-400'}`}>
                      {hasTrips ? m.avgKmL.toFixed(2) : '—'}
                    </div>
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {hasTrips ? (language === 'am' ? 'ኪ.ሜ / ሊ' : 'km / L') : (language === 'am' ? 'ምንም ጉዞ የለም' : language === 'om' ? 'Imalli Hin Jiru' : 'No Trips')}
                    </span>
                    <div className="pt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500">
                      {hasTrips ? (
                        <>
                          <div>{m.totalLiters.toLocaleString()} {language === 'am' ? 'ሊትር' : language === 'om' ? 'Liitirii' : 'Liters'}</div>
                          <div className="font-bold text-slate-700">
                            {m.fuelCostEtb.toLocaleString()} ETB
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 font-medium py-1">—</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ROUTE CORRIDOR SEGMENTS & ELEVATION */}
      {activeSubTab === 'SEGMENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>
                  {language === 'am'
                    ? 'የአዲስ አበባ - ጅቡቲ ኮሪደር ክፍል ቴሌማቲክስ'
                    : language === 'om'
                    ? 'Teelimaatiksii Kutaalee Koriidarii Finfinnee - Jibuutii'
                    : 'Addis Ababa – Djibouti Corridor Segment Telematics'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'የየክፍሉ የመሬት አቀማመጥ፣ የመንገድ ገጽታ፣ የጉዞ ፍጥነት እና የናፍጣ ፍጆታ መመዘኛዎች።'
                  : language === 'om'
                  ? 'Boca olka\'iinsa lafaa, haala daandii, saffisa imalaa fi madaallii fayyadama diizilaa.'
                  : 'Segment-by-segment elevation profile, highway terrain, cruising speeds, and diesel consumption benchmarks.'}
              </p>
            </div>

            <div className="space-y-3.5">
              {data?.corridorSegments.map((seg, idx) => (
                <div
                  key={seg.segmentName}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm">{seg.segmentName}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        {seg.distanceKm} {language === 'am' ? 'ኪ.ሜ' : 'km'}
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        {seg.fuelConsumedLiters > 0
                          ? `${seg.fuelConsumedLiters} ${language === 'am' ? 'ሊትር ተቃጠለ' : language === 'om' ? 'Liitirii Dhumate' : 'Liters Burn'}`
                          : (language === 'am' ? 'ምንም ጉዞ የለም' : language === 'om' ? 'Imalli Hin Jiru' : 'No Trips Recorded')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">
                        {language === 'am' ? 'የመሬት ከፍታ እና ገፅታ' : language === 'om' ? 'Boca Olka\'iinsa Lafaa' : 'Elevation Profile'}
                      </span>
                      <span className="font-extrabold text-slate-800 mt-0.5 block">{seg.elevationProfile}</span>
                      <span className="text-[10px] text-slate-500">{seg.terrainType}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">
                        {language === 'am' ? 'የፍጥነት ቴሌማቲክስ እና ወረፋ' : language === 'om' ? 'Saffisa Teelimaatiksii fi Tarree' : 'Telematics Speeds & Queue'}
                      </span>
                      <span className="font-extrabold text-slate-800 mt-0.5 block">
                        {seg.avgSpeedKmh > 0 ? (
                          <>
                            {language === 'am' ? 'አማካይ' : language === 'om' ? 'Giddu-galeessa' : 'Avg'} {seg.avgSpeedKmh} km/h {language === 'am' ? 'መደበኛ ፍጥነት' : language === 'om' ? 'Saffisa Dhaabbataa' : 'Cruising'}
                          </>
                        ) : (
                          '—'
                        )}
                      </span>
                      <span className="text-[10px] text-amber-600 font-bold">
                        {seg.congestionHours > 0
                          ? `~${seg.congestionHours} ${language === 'am' ? 'ሰዓት የመዘግየት ወረፋ' : language === 'om' ? 'sa\'aatii turuu tarree' : 'hrs queue delay'}`
                          : (language === 'am' ? 'መዘግየት አልተመዘገበም' : language === 'om' ? 'Turuun hin jiru' : 'No Queue Delay')}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">
                        {language === 'am' ? 'የክፍሉ ነዳጅ ኢኮኖሚ' : language === 'om' ? 'Ekonomii Boba\'aa Kutichaa' : 'Segment Fuel Economy'}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-black text-emerald-700 text-sm">
                          {seg.avgKmL > 0 ? `${seg.avgKmL.toFixed(2)} ${language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}` : '—'}
                        </span>
                        <span className="text-[10px] text-slate-400">({language === 'am' ? 'መመዘኛ፦' : 'Bench:'} {seg.benchmarkKmL} km/L)</span>
                      </div>
                      <span className={`text-[10px] font-bold ${
                        seg.avgKmL >= seg.benchmarkKmL ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {seg.avgKmL > 0 ? (
                          seg.avgKmL >= seg.benchmarkKmL
                            ? (language === 'am' ? '✓ በዒላማው ክልል ውስጥ' : language === 'om' ? '✓ Daangaa Ilaalchaa Keessa' : '✓ Within Target Band')
                            : (language === 'am' ? '⚠️ ከባድ ዳገት / የቆመ ሞተር ፍጆታ' : language === 'om' ? '⚠️ Tabba Ulfaataa / Dhaabbachuun Dhumate' : '⚠️ Heavy Incline / Idle Surge')
                        ) : (
                          language === 'am' ? 'ቴሌሜትሪ ይጠበቃል' : language === 'om' ? 'Teelimaatiksii eegama' : 'Awaiting Telematics'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black">{language === 'am' ? 'የኮሪደር መመሪያ፦ ' : language === 'om' ? 'Qajeelfama Koriidarii: ' : 'Corridor Guidance: '}</span> {seg.recommendation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: OPTIMIZATION RECOMMENDATIONS */}
      {activeSubTab === 'RECOMMENDATIONS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {language === 'am'
                  ? 'በመረጃ ላይ የተመሰረቱ የነዳጅ ቁጠባ እና የማሻሻያ ምክረ-ሀሳቦች'
                  : language === 'om'
                  ? 'Yaada Qusannaa Boba\'aa fi Fooyyessa Ragaarratti Hundaa\'e'
                  : 'Data-Driven Fuel Savings & Efficiency Suggestions'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'የማሽከርከር ባህሪን፣ የመንገድ ከፍታዎችን እና የተሽከርካሪ ቅድመ-ጥገናን ያካተቱ እርምጃዎች።'
                  : language === 'om'
                  ? 'Tarkaanfiiwwan amala konkolaachisummaa, olka\'iinsa daandii fi suphaa dursee raawwatamu.'
                  : 'Actionable interventions across driving behavior, terrain gradients, and preventive maintenance.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRecommendationFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  recommendationFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'am' ? 'ሁሉም ምክረ-ሀሳቦች' : language === 'om' ? 'Yaada Hunda' : 'All Recommendations'}
              </button>
              <button
                onClick={() => setRecommendationFilter('DRIVING_BEHAVIOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  recommendationFilter === 'DRIVING_BEHAVIOR'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'am' ? 'የማሽከርከር ባህሪ' : language === 'om' ? 'Amala Konkolaachisaa' : 'Driving Behavior'}
              </button>
              <button
                onClick={() => setRecommendationFilter('ROUTE_ELEVATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  recommendationFilter === 'ROUTE_ELEVATION'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'am' ? 'የመንገድ ከፍታ' : language === 'om' ? 'Olka\'iinsa Daandii' : 'Route Elevation'}
              </button>
              <button
                onClick={() => setRecommendationFilter('VEHICLE_MAINTENANCE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  recommendationFilter === 'VEHICLE_MAINTENANCE'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'am' ? 'የተሽከርካሪ ጥገና' : language === 'om' ? 'Suphaa Konkolaataa' : 'Maintenance'}
              </button>
            </div>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {language === 'am'
                  ? 'ምንም የተመዘገበ የጉዞ መረጃ የለም'
                  : language === 'om'
                  ? 'Odeeffannoon Imala Galmaa\'e Hin Jiru'
                  : 'No Active Trip Telematics Recorded'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {language === 'am'
                  ? 'በመረጃ ላይ የተመሰረቱ የነዳጅ ቁጠባ ምክረ-ሀሳቦች የሚመነጩት ተሽከርካሪዎች ጭነት ተረክበው በኢትዮ-ጅቡቲ ኮሪደር ላይ ሲጓጓዙ ብቻ ነው።'
                  : language === 'om'
                  ? 'Gorsi qusannaa boba\'aa ragaarratti hundaa\'e kan maddisiifamu yeroo konkolaattonni fe\'iisa fudhatanii koriidarii Itoophiyaa-Jibuutii irratti imalan qofa.'
                  : 'Data-driven fuel optimization recommendations are dynamically generated once freight consignments are dispatched and telemetry is recorded along the Ethio-Djibouti corridor.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuggestions.map((sugg) => {
                const categoryColor =
                  sugg.category === 'DRIVING_BEHAVIOR'
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : sugg.category === 'ROUTE_ELEVATION'
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <div
                    key={sugg.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${categoryColor}`}>
                          {sugg.category === 'DRIVING_BEHAVIOR'
                            ? (language === 'am' ? 'የማሽከርከር ባህሪ' : language === 'om' ? 'Amala Konkolaachisaa' : 'Driving Behavior')
                            : sugg.category === 'ROUTE_ELEVATION'
                            ? (language === 'am' ? 'የመንገድ ከፍታ' : language === 'om' ? 'Olka\'iinsa Daandii' : 'Route Elevation')
                            : (language === 'am' ? 'የተሽከርካሪ ጥገና' : language === 'om' ? 'Suphaa Konkolaataa' : 'Maintenance')}
                        </span>
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                          {sugg.impactTag}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {sugg.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {sugg.description}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">
                          {language === 'am' ? 'ተግባራዊ መመሪያ' : language === 'om' ? 'Qajeelfama Hojiirra Oolu' : 'Actionable Protocol'}
                        </span>
                        <p className="text-slate-800 font-medium">{sugg.actionableAdvice}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block">
                          {language === 'am' ? 'የተገመተ ቁጠባ' : language === 'om' ? 'Tilmaama Qusannaa' : 'Estimated Savings'}
                        </span>
                        <div className="text-sm font-black text-emerald-700">
                          {sugg.estimatedMonthlySavingsEtb.toLocaleString()} ETB / {language === 'am' ? 'ወር' : language === 'om' ? 'Ji\'a' : 'Month'}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">
                          ({sugg.estimatedSavingsLitersMonth} {language === 'am' ? 'ሊትር ተቆጠበ' : language === 'om' ? 'Liitirii qusatame' : 'Liters saved'})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Applied protocol: "${sugg.title}". Dispatch guidelines updated.`)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{language === 'am' ? 'መስፈርቱን ተግብር' : language === 'om' ? 'Sadarkaa Hojiirra Oolchi' : 'Apply Standard'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
