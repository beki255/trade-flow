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
import { useLanguage } from '../../../context/LanguageContext';

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
  const { language: rawLanguage } = useLanguage();
  const isAm = (rawLanguage || '').toUpperCase() === 'AM';
  const isOm = (rawLanguage || '').toUpperCase() === 'OM';
  const language = isAm ? 'am' : isOm ? 'om' : 'en';
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
    const timer = setInterval(fetchPerformance, 12000);
    return () => clearInterval(timer);
  }, [transporterId]);

  const translateMetricLabel = (label: string) => {
    switch (label) {
      case 'On-Time Delivery Rate':
        return language === 'am' ? 'በሰዓቱ የማድረስ ምጣኔ' : language === 'om' ? 'Hamma Yeroon Dhaqqabuu' : label;
      case 'Fleet Fuel Economy':
        return language === 'am' ? 'የተሽከርካሪዎች ነዳጅ ቁጠባ' : language === 'om' ? "Qusannaa Boba'aa Konkolaattotaa" : label;
      case 'Incident Rate (per 100 trips)':
        return language === 'am' ? 'የአደጋ ምጣኔ (በ100 ጉዞ)' : language === 'om' ? 'Hamma Balaa (imala 100 keessatti)' : label;
      case 'Customer Satisfaction Rating':
        return language === 'am' ? 'የደንበኛ እርካታ ደረጃ' : language === 'om' ? 'Sadarkaa Itti Quufinsa Maamilaa' : label;
      default:
        return label;
    }
  };

  const translatePercentileRank = (rankStr: string) => {
    if (!rankStr) return '';
    if (rankStr.includes('Top 6% on Djibouti Corridor')) {
      return language === 'am'
        ? 'በጅቡቲ ኮሪደር ከፍተኛ 6% ውስጥ'
        : language === 'om'
        ? 'Koriidarii Jibuutii irratti 6% Olaanaa'
        : rankStr;
    }
    return rankStr;
  };

  if (loading && !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
          <TrendingUp className="w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-base font-black text-slate-800">
          {language === 'am'
            ? 'የኮሪደር ተሽከርካሪዎች መመዘኛ በመሰላት ላይ...'
            : language === 'om'
            ? 'Madaallii Konkolaattota Koriidarii Hissabamaa Jira...'
            : 'Calculating Corridor Fleet Benchmarks...'}
        </h4>
        <p className="text-xs text-slate-500">
          {language === 'am'
            ? 'የተጠናቀቁ ጭነቶች፣ የቴሌሜትሪ አማካዮች እና የደረጃ ውጤቶች በመፈለግ ላይ።'
            : language === 'om'
            ? "Fe'iinsa xumuraman, giddu-galeessa telemetirii fi madaalliiwwan barbaadamaa jiru."
            : 'Querying completed shipments, telemetry averages, and rating aggregates.'}
        </p>
      </div>
    );
  }

  const kpis: TransporterKPIs = data?.summaryKpis || {
    onTimeDeliveryRatePct: 0,
    incidentRatePer100Trips: 0,
    averageFuelEfficiencyKmL: 0,
    customerSatisfactionStars: 0,
    totalReviewsCount: 0,
    totalTripsCompleted: 0,
    grossRevenueEarnedEtb: 0,
    netPayoutsReceivedEtb: 0,
    platformCommissionDeductedEtb: 0,
    totalActiveVehicles: 0,
  };

  const benchmarks = data?.benchmarkingComparison || {
    transporterName: '—',
    percentileRank: '',
    metrics: [],
    percentileGauges: {
      deliveryAdherence: 0,
      fuelEcoEfficiency: 0,
      cargoSafetyScore: 0,
      shipperSatisfaction: 0,
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
              {language === 'am'
                ? 'የትራንስፖርተር ብቃት እና የኮሪደር ንጽጽር መመዘኛ'
                : language === 'om'
                ? "Ga'umsa Fe'aa fi Madaallii Koriidarii"
                : 'Transporter Performance & Corridor Benchmarking'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {language === 'am'
                ? 'የተሽከርካሪዎችን የሥራ አፈጻጸም ቁልፍ መለኪያዎች (KPI) በአዲስ አበባ - ጅቡቲ የንግድ ኮሪደር ላይ ካሉ አማካዮች እና ከፍተኛ 10% ፈጻሚዎች ጋር በማነጻጸር የቀረበ ራስ-አገዝ ግምገማ።'
                : language === 'om'
                ? 'Madaallii raawwii konkolaattotaa kan kpi hojii giddu-galeessa koriidarii Finfinnee - Jibuutii fi 10% raawwattoota olaanoo waliin madaalu.'
                : 'Self-service performance evaluation comparing fleet operational KPIs against anonymized corridor averages and top-tier 10% performers on the Addis Ababa – Djibouti trade corridor.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                {language === 'am' ? 'የተሽከርካሪዎች ደረጃ' : language === 'om' ? 'Sadarkaa Konkolaattotaa' : 'Fleet Standing'}
              </span>
              <span className="text-sm font-extrabold text-indigo-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {translatePercentileRank(benchmarks.percentileRank)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Aggregated KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: On-Time Delivery */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'በሰዓቱ የመድረስ ምጣኔ' : language === 'om' ? 'Hamma Yeroon Dhaqqabuu' : 'On-Time Rate'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.onTimeDeliveryRatePct}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {language === 'am'
              ? 'የኮሪደሩ አማካይ: 89.4% (+7.1%)'
              : language === 'om'
              ? 'Giddu-galeessa Koriidarii: 89.4% (+7.1%)'
              : 'Corridor Avg: 89.4% (+7.1%)'}
          </div>
        </div>

        {/* KPI 2: Incident Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'የአደጋ ምጣኔ' : language === 'om' ? 'Hamma Balaa' : 'Incident Rate'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.incidentRatePer100Trips}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {language === 'am' ? 'በየ 100 የተጠናቀቁ ጉዞዎች' : language === 'om' ? 'Imala 100 Xumurame Keessaa' : 'Per 100 Completed Trips'}
          </div>
        </div>

        {/* KPI 3: Fuel Efficiency */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'የነዳጅ ቁጠባ' : language === 'om' ? "Qusannaa Boba'aa" : 'Fuel Economy'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.averageFuelEfficiencyKmL}{' '}
            <span className="text-xs font-bold text-slate-500">
              {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {language === 'am' ? 'መመዘኛ: 2.75 ኪ.ሜ/ሊ' : language === 'om' ? 'Madaallii: 2.75 km/L' : 'Benchmark: 2.75 km/L'}
          </div>
        </div>

        {/* KPI 4: Customer Satisfaction */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'የደንበኛ እርካታ' : language === 'om' ? 'Itti Quufinsa' : 'Satisfaction'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{kpis.customerSatisfactionStars}</span>
            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {language === 'am'
              ? `ከ ${kpis.totalReviewsCount} የተረጋገጡ አስተያየቶች`
              : language === 'om'
              ? `Yaada Mirkanaa'e ${kpis.totalReviewsCount} Irraa`
              : `From ${kpis.totalReviewsCount} Verified Reviews`}
          </div>
        </div>

        {/* KPI 5: Gross Revenue Earned */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1 col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'am' ? 'ጠቅላላ ገቢ' : language === 'om' ? 'Galii Waliigalaa' : 'Gross Revenue'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {(kpis.grossRevenueEarnedEtb / 1000000).toFixed(2)}M <span className="text-xs font-bold text-slate-500">ETB</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {language === 'am'
              ? `በ ${kpis.totalTripsCompleted} የተጠናቀቁ ጉዞዎች`
              : language === 'om'
              ? `Imala ${kpis.totalTripsCompleted} Xumurame Keessaa`
              : `Across ${kpis.totalTripsCompleted} Completed Trips`}
          </div>
        </div>
      </div>

      {/* 3. Benchmarking Comparison Table (Transporter vs Corridor Avg vs Top 10%) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" />
              <span>
                {language === 'am'
                  ? 'የኮሪደሩ የንጽጽር መመዘኛ ማትሪክስ'
                  : language === 'om'
                  ? 'Madaallii Waliin Dorgommii Koriidarii'
                  : 'Corridor Comparative Benchmarking Matrix'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'am'
                ? 'በኢትዮ-ጅቡቲ ኮሪደር ላይ ካሉ ከ 420+ በላይ የተመዘገቡ የንግድ ትራንስፖርት ኦፕሬተሮች ጋር የተነጻጸረ።'
                : language === 'om'
                ? "Fe'attoota daldalaa galmaa'an 420+ koriidarii Itoophiyaa-Jibuutii waliin kan madaalame."
                : 'Evaluated against 420+ registered commercial transport operators on the Ethio-Djibouti corridor.'}
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            {language === 'am'
              ? '✓ ከፍተኛ ደረጃ ኦፕሬተር'
              : language === 'om'
              ? '✓ Sadarkaa Fe\'aa Olaanaa'
              : '✓ Top-Tier Operator Status'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">
                  {language === 'am' ? 'ዋና መለኪያ' : language === 'om' ? 'Ulaagaa Bu\'uuraa' : 'Core Metric'}
                </th>
                <th className="py-3 px-4 text-center">
                  {language === 'am' ? 'የእርስዎ ተሽከርካሪዎች' : language === 'om' ? 'Konkolaattota Keessan' : 'Your Fleet'}
                </th>
                <th className="py-3 px-4 text-center">
                  {language === 'am' ? 'የኮሪደሩ አማካይ' : language === 'om' ? 'Giddu-galeessa Koriidarii' : 'Corridor Average'}
                </th>
                <th className="py-3 px-4 text-center">
                  {language === 'am' ? 'ከፍተኛ 10% መሪዎች' : language === 'om' ? 'Dursitoota 10% Olaanoo' : 'Top 10% Leaders'}
                </th>
                <th className="py-3 px-4 text-center">
                  {language === 'am' ? 'በኮሪደሩ ያለው ደረጃ' : language === 'om' ? 'Sadarkaa Koriidarii' : 'Corridor Standing'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.metrics.map((m: BenchmarkMetric) => (
                <tr key={m.label} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900">{translateMetricLabel(m.label)}</td>
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
                      {language === 'am'
                        ? `${m.percentileScore}ኛ ፐርሰንታይል`
                        : language === 'om'
                        ? `Dhibbeentaa ${m.percentileScore}ffaa`
                        : `${m.percentileScore}th Percentile`}
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
              <span>
                {language === 'am'
                  ? 'የአሠራር ብቃት መለኪያ ፐርሰንታይሎች'
                  : language === 'om'
                  ? 'Safartuuwwan Dhibbeentaa Hojii'
                  : 'Operational Percentile Gauges'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'am'
                ? 'ከሁሉም ንቁ የኮሪደር አጓጓዦች አንጻር ያለው የአፈጻጸም አቀማመጥ።'
                : language === 'om'
                ? "Sadarkaa raawwii fe'attoota koriidarii socho'an hunda waliin."
                : 'Performance positioning relative to all active corridor carriers.'}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">
                  {language === 'am'
                    ? 'የማድረሻ የጊዜ ሰሌዳን ማክበር'
                    : language === 'om'
                    ? 'Sagantaa Dhaqqabii Kabajuu'
                    : 'Delivery Schedule Adherence'}
                </span>
                <span className="text-indigo-600">
                  {benchmarks.percentileGauges?.deliveryAdherence}% (
                  {language === 'am' ? 'ከፍተኛ 5% ውስጥ' : language === 'om' ? '5% Olaanaa' : 'Top 5%'}
                  )
                </span>
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
                <span className="text-slate-700">
                  {language === 'am'
                    ? 'የነዳጅ ቆጣቢነት ውጤት'
                    : language === 'om'
                    ? "Qabxii Qusannaa Boba'aa"
                    : 'Fuel Eco-Efficiency Score'}
                </span>
                <span className="text-emerald-600">
                  {benchmarks.percentileGauges?.fuelEcoEfficiency}% (
                  {language === 'am' ? 'ከፍተኛ 8% ውስጥ' : language === 'om' ? '8% Olaanaa' : 'Top 8%'}
                  )
                </span>
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
                <span className="text-slate-700">
                  {language === 'am'
                    ? 'የጭነት ደህንነት እና ከጉዳት ነጻ መዝገብ'
                    : language === 'om'
                    ? "Nageenya Fe'iinsaa fi Galmee Balaa Malee"
                    : 'Cargo Safety & Zero-Incident Record'}
                </span>
                <span className="text-sky-600">
                  {benchmarks.percentileGauges?.cargoSafetyScore}% (
                  {language === 'am' ? 'ከፍተኛ 3% ውስጥ' : language === 'om' ? '3% Olaanaa' : 'Top 3%'}
                  )
                </span>
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
                <span className="text-slate-700">
                  {language === 'am'
                    ? 'የላኪዎች ታማኝነት እና እርካታ መረጃ ጠቋሚ'
                    : language === 'om'
                    ? 'Amanamtummaa fi Itti Quufinsa Ergitootaa'
                    : 'Shipper Loyalty & Satisfaction Index'}
                </span>
                <span className="text-amber-600">
                  {benchmarks.percentileGauges?.shipperSatisfaction}% (
                  {language === 'am' ? 'ከፍተኛ 4% ውስጥ' : language === 'om' ? '4% Olaanaa' : 'Top 4%'}
                  )
                </span>
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
                <span>
                  {language === 'am'
                    ? 'የወርሃዊ አዝማሚያ ታሪክ'
                    : language === 'om'
                    ? 'Teephoo Raawwii Ji\'ootaa'
                    : 'Historical Monthly Trend Lines'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'የ 6 ወራት ተከታታይ የሥራ አዝማሚያ።'
                  : language === 'om'
                  ? "Adeemsa hojii ji'oota 6 darban."
                  : '6-month rolling operational trends.'}
              </p>
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
                  {t.onTimeRatePct}%{' '}
                  <span className="text-[10px] font-bold text-slate-400">
                    {language === 'am' ? 'በሰዓቱ' : language === 'om' ? 'Yeroon' : 'On-Time'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold">
                  {t.tripsCompleted} {language === 'am' ? 'ጉዞዎች' : language === 'om' ? 'Imala' : 'Trips'} • {t.fuelEfficiencyKmL}{' '}
                  {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}
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
              <span>
                {language === 'am'
                  ? 'የተመደቡ ተሽከርካሪዎች የብቃት ዝርዝር'
                  : language === 'om'
                  ? "Caccabsa Ga'umsa Konkolaattota Ramadamanii"
                  : 'Assigned Fleet Vehicle Efficiency Breakdown'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'am'
                ? 'የእያንዳንዱ ተሽከርካሪ አፈጻጸም ከኮሪደሩ የምህንድስና መመዘኛ ኢላማዎች ጋር ተነጻጽሯል።'
                : language === 'om'
                ? 'Raawwiin tokkoon tokkoo makiinaa madaallii injinarummaa koriidarii waliin madaalameera.'
                : 'Individual truck performance compared against corridor engineering benchmark targets.'}
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
                    {v.status === 'OPTIMAL'
                      ? language === 'am' ? 'ምርጥ' : language === 'om' ? 'Gaarii' : 'Optimal'
                      : language === 'am' ? 'ከዒላማው በታች' : language === 'om' ? 'Ilaalcha Gadi' : 'Below Target'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {v.vehicleType} • {v.capacityTons}{language === 'am' ? 'ቶን' : language === 'om' ? 'T' : 'T'}
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">
                    {language === 'am' ? 'ትክክለኛ:' : language === 'om' ? 'Qabatamaa:' : 'Actual:'}{' '}
                    <strong className="text-slate-900">{v.actualKmL} {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}</strong>
                  </span>
                  <span className="text-slate-400">
                    {language === 'am' ? 'ዒላማ:' : language === 'om' ? 'Ilaalcha:' : 'Target:'} {v.benchmarkKmL} {language === 'am' ? 'ኪ.ሜ/ሊ' : 'km/L'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
