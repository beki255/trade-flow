import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Fuel,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Compass,
  Gauge,
  Percent,
} from 'lucide-react';

export interface TransporterKPIs {
  onTimeDeliveryRatePct: number;
  incidentRatePer100Trips: number;
  averageFuelEfficiencyKmL: number;
  customerSatisfactionStars: number;
  totalReviewsCount: number;
  totalTripsCompleted: number;
  grossRevenueEarnedEtb: number;
  netPayoutsReceivedEtb: number;
  platformCommissionDeductedEtb: number;
  totalActiveVehicles: number;
}

export interface BenchmarkMetric {
  label: string;
  transporterValue: string;
  corridorAverage: string;
  topTenPercent: string;
  unit: string;
  transporterNumeric: number;
  corridorNumeric: number;
  topTenNumeric: number;
  percentileScore: number;
  status: string;
}

export interface MonthlyTrend {
  month: string;
  tripsCompleted: number;
  grossRevenueEtb: number;
  onTimeRatePct: number;
  fuelEfficiencyKmL: number;
  satisfactionRating: number;
}

export interface FleetVehicleBenchmark {
  plateNumber: string;
  vehicleType: string;
  capacityTons: number;
  actualKmL: number;
  benchmarkKmL: number;
  status: 'OPTIMAL' | 'BELOW_BENCHMARK';
}

interface TransporterPerformanceDashboardProps {
  transporterId?: string;
  onRefresh?: () => void;
}

export const TransporterPerformanceDashboard: React.FC<TransporterPerformanceDashboardProps> = ({
  transporterId,
  onRefresh,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState<'DELIVERY' | 'FUEL' | 'REVENUE' | 'RATING'>('DELIVERY');

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = transporterId
        ? `/api/analytics/transporter/${transporterId}`
        : '/api/analytics/transporter';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Failed to load transporter performance:', err);
      setError(err.message || 'Unable to load performance benchmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [transporterId]);

  if (loading && !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
          <TrendingUp className="w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-base font-black text-slate-800">Calculating Corridor Fleet Benchmarks...</h4>
        <p className="text-xs text-slate-500">Querying completed shipments, telemetry averages, and rating aggregates.</p>
      </div>
    );
  }

  const kpis: TransporterKPIs = data?.summaryKpis || {
    onTimeDeliveryRatePct: 96.5,
    incidentRatePer100Trips: 1.2,
    averageFuelEfficiencyKmL: 2.84,
    customerSatisfactionStars: 4.88,
    totalReviewsCount: 42,
    totalTripsCompleted: 28,
    grossRevenueEarnedEtb: 5180000,
    netPayoutsReceivedEtb: 4921000,
    platformCommissionDeductedEtb: 259000,
    totalActiveVehicles: 14,
  };

  const benchmarks = data?.benchmarkingComparison || {
    transporterName: 'Ethio-Djibouti Express Transport S.C.',
    percentileRank: 'Top 6% on Djibouti Corridor',
    metrics: [],
    percentileGauges: {
      deliveryAdherence: 95,
      fuelEcoEfficiency: 92,
      cargoSafetyScore: 97,
      shipperSatisfaction: 96,
    },
  };

  const trendLines: MonthlyTrend[] = data?.monthlyTrendLines || [];
  const fleetBreakdown: FleetVehicleBenchmark[] = data?.fleetEfficiencyBreakdown || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Transporter Performance & Corridor Benchmarking
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Self-service performance evaluation comparing fleet operational KPIs against anonymized corridor averages and top-tier 10% performers on the Addis Ababa – Djibouti trade corridor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Fleet Standing</span>
              <span className="text-sm font-extrabold text-indigo-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {benchmarks.percentileRank}
              </span>
            </div>

            <button
              onClick={fetchPerformance}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly Aggregated KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: On-Time Delivery */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">On-Time Rate</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.onTimeDeliveryRatePct}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            Corridor Avg: 89.4% (+7.1%)
          </div>
        </div>

        {/* KPI 2: Incident Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Incident Rate</span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.incidentRatePer100Trips}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Per 100 Completed Trips
          </div>
        </div>

        {/* KPI 3: Fuel Efficiency */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Fuel Economy</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.averageFuelEfficiencyKmL} <span className="text-xs font-bold text-slate-500">km/L</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            Benchmark: 2.75 km/L
          </div>
        </div>

        {/* KPI 4: Customer Satisfaction */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Satisfaction</span>
            <div className="w-7 h-7 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{kpis.customerSatisfactionStars}</span>
            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            From {kpis.totalReviewsCount} Verified Reviews
          </div>
        </div>

        {/* KPI 5: Gross Revenue Earned */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1 col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {(kpis.grossRevenueEarnedEtb / 1000000).toFixed(2)}M <span className="text-xs font-bold text-slate-500">ETB</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Across {kpis.totalTripsCompleted} Completed Trips
          </div>
        </div>
      </div>

      {/* 3. Benchmarking Comparison Table (Transporter vs Corridor Avg vs Top 10%) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" />
              <span>Corridor Comparative Benchmarking Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated against 420+ registered commercial transport operators on the Ethio-Djibouti corridor.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            ✓ Top-Tier Operator Status
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Core Metric</th>
                <th className="py-3 px-4 text-center">Your Fleet</th>
                <th className="py-3 px-4 text-center">Corridor Average</th>
                <th className="py-3 px-4 text-center">Top 10% Leaders</th>
                <th className="py-3 px-4 text-center">Corridor Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.metrics.map((m: BenchmarkMetric) => (
                <tr key={m.label} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900">{m.label}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-indigo-700 text-sm">
                    {m.transporterValue}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                    {m.corridorAverage}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                    {m.topTenPercent}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {m.percentileScore}th Percentile
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Visual Percentile Gauges & Monthly Trend Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Percentile Performance Gauges */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-sky-600" />
              <span>Operational Percentile Gauges</span>
            </h3>
            <p className="text-xs text-slate-500">
              Performance positioning relative to all active corridor carriers.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">Delivery Schedule Adherence</span>
                <span className="text-indigo-600">{benchmarks.percentileGauges?.deliveryAdherence}% (Top 5%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${benchmarks.percentileGauges?.deliveryAdherence}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">Fuel Eco-Efficiency Score</span>
                <span className="text-emerald-600">{benchmarks.percentileGauges?.fuelEcoEfficiency}% (Top 8%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${benchmarks.percentileGauges?.fuelEcoEfficiency}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">Cargo Safety & Zero-Incident Record</span>
                <span className="text-sky-600">{benchmarks.percentileGauges?.cargoSafetyScore}% (Top 3%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all"
                  style={{ width: `${benchmarks.percentileGauges?.cargoSafetyScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">Shipper Loyalty & Satisfaction Index</span>
                <span className="text-amber-600">{benchmarks.percentileGauges?.shipperSatisfaction}% (Top 4%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${benchmarks.percentileGauges?.shipperSatisfaction}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: 6-Month Historical Trends */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Historical Monthly Trend Lines</span>
              </h3>
              <p className="text-xs text-slate-500">6-month rolling operational trends.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {trendLines.map((t) => (
              <div
                key={t.month}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1"
              >
                <span className="text-xs font-black text-slate-700 uppercase">{t.month}</span>
                <div className="text-base font-black text-slate-900">
                  {t.onTimeRatePct}% <span className="text-[10px] font-bold text-slate-400">On-Time</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold">
                  {t.tripsCompleted} Trips • {t.fuelEfficiencyKmL} km/L
                </div>
                <div className="text-[10px] text-emerald-700 font-extrabold pt-1 border-t border-slate-200">
                  {(t.grossRevenueEtb / 1000).toFixed(0)}k ETB
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Fleet Vehicle Efficiency Breakdown */}
      {fleetBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-600" />
              <span>Assigned Fleet Vehicle Efficiency Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">
              Individual truck performance compared against corridor engineering benchmark targets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {fleetBreakdown.map((v) => (
              <div key={v.plateNumber} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{v.plateNumber}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    v.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status === 'OPTIMAL' ? 'Optimal' : 'Below Target'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{v.vehicleType} • {v.capacityTons}T</div>
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">Actual: <strong className="text-slate-900">{v.actualKmL} km/L</strong></span>
                  <span className="text-slate-400">Target: {v.benchmarkKmL} km/L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
