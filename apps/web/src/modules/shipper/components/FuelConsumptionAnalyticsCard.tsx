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
  RefreshCw,
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
} from 'lucide-react';

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
    averageEfficiencyKmL: 2.75,
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
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-bold tracking-wide">
              <Fuel className="w-3.5 h-3.5 text-amber-600" />
              <span>Corridor Fuel Telematics & Efficiency Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Fuel Consumption Analytics & Benchmarking
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Consolidated telematics tracking combining GPS speed profiles with driver purchase logs along the Addis Ababa – Djibouti freight corridor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Diesel Rate Index</span>
              <span className="text-sm font-extrabold text-amber-900">
                {summary.activeDieselPricePerLiter.toFixed(2)} ETB / Liter
              </span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Telematics</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE METRICS KPI ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Liters Consumed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Fuel Consumed</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {summary.totalActualLiters.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">Liters</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Est: {summary.totalEstimatedLiters.toLocaleString()} L</span>
          </div>
        </div>

        {/* KPI 2: Total Fuel Cost */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Fuel Cost</span>
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
            Across {summary.totalTripsTracked} freight trips
          </div>
        </div>

        {/* KPI 3: Fleet Fuel Efficiency */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Fleet Efficiency</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              isEfficiencyOptimal ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-xl sm:text-2xl font-black tracking-tight ${
              isEfficiencyOptimal ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {summary.averageEfficiencyKmL.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-500">km / L</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Benchmark: <span className="font-bold">{summary.corridorBenchmarkKmL} km/L</span>
          </div>
        </div>

        {/* KPI 4: Total Distance Covered */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Haulage</span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {summary.totalDistanceKm.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">km</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Corridor Highway Logs
          </div>
        </div>

        {/* KPI 5: Net Outlier Savings / Variance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Net Fuel Delta</span>
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
            {summary.totalSavingsEtb >= 0 ? 'Cost Saved vs Estimate' : 'Excess Over Baseline'}
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
            <span>Trip Consumption Logs ({data?.completedTrips.length || 0})</span>
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
            <span>Vehicle & Driver Benchmarks</span>
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
            <span>Corridor Segments & Elevation</span>
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
            <span>Optimization Recommendations ({data?.optimizationSuggestions.length || 0})</span>
          </button>
        </div>

        {activeSubTab === 'TRIPS' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plate, driver..."
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
              <option value="ALL">All Trips</option>
              <option value="POSITIVE_SAVINGS">Positive Savers</option>
              <option value="EXCESSIVE_CONSUMPTION">Excessive Burn</option>
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
                  Top Fuel Saving Outliers ({data?.outliers.positiveSavers.length || 0})
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Below Estimated Liters
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Trips where drivers maintained steady corridor cruising (55–65 km/h) and smooth elevation management, reducing diesel burn by up to 8.5%.
              </p>
            </div>

            {/* Excessive Consumers Highlight */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Excessive Consumption Outliers ({data?.outliers.excessiveConsumers.length || 0})
                </span>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Exceeding Estimates
                </span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                Corridor runs with elevated consumption caused by high expressway drag (&gt;75 km/h) or extended stationary idling at Galafi customs holds.
              </p>
            </div>
          </div>

          {/* Trips Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Completed Freight Trip Telematics & Purchase Records
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-validated against GPS telemetry speed feeds and driver fuel station vouchers.
                </p>
              </div>
              <div className="text-xs font-bold text-slate-500">
                Showing {filteredTrips.length} recorded trips
              </div>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Fuel className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold">No completed corridor trips found matching filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4">Shipment & Route</th>
                      <th className="py-3.5 px-4">Vehicle & Driver</th>
                      <th className="py-3.5 px-4 text-right">Est. Liters</th>
                      <th className="py-3.5 px-4 text-right">Actual Liters</th>
                      <th className="py-3.5 px-4 text-right">Fuel Cost</th>
                      <th className="py-3.5 px-4 text-right">Efficiency</th>
                      <th className="py-3.5 px-4 text-center">Variance %</th>
                      <th className="py-3.5 px-4 text-center">Telematics Source</th>
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
                                  Top Saver
                                </span>
                              )}
                              {trip.outlierStatus === 'EXCESSIVE_CONSUMPTION' && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                  High Burn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                              <span>{trip.origin}</span>
                              <span className="text-slate-400">➔</span>
                              <span>{trip.destination}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {trip.distanceKm} km • {trip.cargoTitle} {trip.weightTons ? `(${trip.weightTons}T)` : ''}
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
                              Class: {trip.vehicleType.replace(/_/g, ' ')}
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
                              Avg {trip.avgSpeedKmh} km/h
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
                              {trip.savingsCostEtb >= 0 ? 'Saved ' : 'Over '}
                              {Math.abs(trip.savingsCostEtb).toLocaleString()} ETB
                            </div>
                          </td>

                          {/* Efficiency km/L */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-black text-slate-900">
                              {trip.actualKmL.toFixed(2)} km/L
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Bench: {trip.benchmarkKmL} km/L
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
                <span>Vehicle Class Fuel Efficiency Benchmarking</span>
              </h3>
              <p className="text-xs text-slate-500">
                Fleet average fuel economy compared against Djibouti corridor engineering baselines.
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
                      {vc.efficiencyRating === 'OPTIMAL' ? 'Optimal Burn' : 'Below Target'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">{vc.avgKmL.toFixed(2)}</span>
                      <span className="text-xs font-bold text-slate-500 ml-1">km / L</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Benchmark</span>
                      <span className="text-xs font-bold text-slate-700">{vc.benchmarkKmL.toFixed(2)} km/L</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Active Trucks: {vc.count}</span>
                    <span className={vc.deltaPct >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                      {vc.deltaPct >= 0 ? '+' : ''}{vc.deltaPct}% vs Benchmark
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
                <span>Driver Eco-Driving & Fuel Economy Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-500">
                Driver rankings based on actual corridor km/L, safety performance, and throttle modulation.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Rank & Driver</th>
                    <th className="py-3 px-4">Assigned Vehicle</th>
                    <th className="py-3 px-4 text-center">Completed Trips</th>
                    <th className="py-3 px-4 text-right">Avg Economy</th>
                    <th className="py-3 px-4 text-center">Eco Score</th>
                    <th className="py-3 px-4 text-center">Safety Score</th>
                    <th className="py-3 px-4 text-center">Efficiency Rating</th>
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
                          {drv.avgKmL.toFixed(2)} km/L
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
                            ? '★ Top Saver'
                            : drv.efficiencyStatus === 'EXCESSIVE_CONSUMPTION'
                            ? 'Excessive Burn'
                            : 'Balanced'}
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
                <span>Monthly Fuel Consumption & Efficiency History</span>
              </h3>
              <p className="text-xs text-slate-500">
                6-month rolling aggregation of diesel volume, expenditures, and average corridor km/L.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {data?.monthlyTrends.map((m) => (
                <div key={m.month} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
                  <span className="text-xs font-black text-slate-700 uppercase">{m.month}</span>
                  <div className="text-lg font-black text-slate-900">{m.avgKmL.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-500 block font-bold">km / L</span>
                  <div className="pt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500">
                    <div>{m.totalLiters.toLocaleString()} Liters</div>
                    <div className="font-bold text-slate-700">{m.fuelCostEtb.toLocaleString()} ETB</div>
                  </div>
                </div>
              ))}
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
                <span>Addis Ababa – Djibouti Corridor Segment Telematics</span>
              </h3>
              <p className="text-xs text-slate-500">
                Segment-by-segment elevation profile, highway terrain, cruising speeds, and diesel consumption benchmarks.
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
                        {seg.distanceKm} km
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        {seg.fuelConsumedLiters} Liters Burn
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Elevation Profile</span>
                      <span className="font-extrabold text-slate-800 mt-0.5 block">{seg.elevationProfile}</span>
                      <span className="text-[10px] text-slate-500">{seg.terrainType}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Telematics Speeds & Queue</span>
                      <span className="font-extrabold text-slate-800 mt-0.5 block">Avg {seg.avgSpeedKmh} km/h Cruising</span>
                      <span className="text-[10px] text-amber-600 font-bold">~{seg.congestionHours} hrs queue delay</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Segment Fuel Economy</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-black text-emerald-700 text-sm">{seg.avgKmL.toFixed(2)} km/L</span>
                        <span className="text-[10px] text-slate-400">(Bench: {seg.benchmarkKmL} km/L)</span>
                      </div>
                      <span className={`text-[10px] font-bold ${
                        seg.avgKmL >= seg.benchmarkKmL ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {seg.avgKmL >= seg.benchmarkKmL ? '✓ Within Target Band' : '⚠️ Heavy Incline / Idle Surge'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black">Corridor Guidance:</span> {seg.recommendation}
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
                Data-Driven Fuel Savings & Efficiency Suggestions
              </h3>
              <p className="text-xs text-slate-500">
                Actionable interventions across driving behavior, terrain gradients, and preventive maintenance.
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
                All Recommendations
              </button>
              <button
                onClick={() => setRecommendationFilter('DRIVING_BEHAVIOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  recommendationFilter === 'DRIVING_BEHAVIOR'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Driving Behavior
              </button>
              <button
                onClick={() => setRecommendationFilter('ROUTE_ELEVATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  recommendationFilter === 'ROUTE_ELEVATION'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Route Elevation
              </button>
              <button
                onClick={() => setRecommendationFilter('VEHICLE_MAINTENANCE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  recommendationFilter === 'VEHICLE_MAINTENANCE'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Maintenance
              </button>
            </div>
          </div>

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
                        {sugg.category.replace(/_/g, ' ')}
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
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Actionable Protocol</span>
                      <p className="text-slate-800 font-medium">{sugg.actionableAdvice}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Estimated Savings</span>
                      <div className="text-sm font-black text-emerald-700">
                        {sugg.estimatedMonthlySavingsEtb.toLocaleString()} ETB / Month
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">
                        ({sugg.estimatedSavingsLitersMonth} Liters saved)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Applied protocol: "${sugg.title}". Dispatch guidelines updated.`)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply Standard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
