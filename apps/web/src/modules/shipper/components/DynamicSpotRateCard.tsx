import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Fuel,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { LocationData, SpotPricingResult } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

interface DynamicSpotRateCardProps {
  originLocation: LocationData;
  destinationLocation: LocationData;
  corridorDistanceKm: number;
  weightTons: string;
  cargoCategory: string;
  specialHandling: string;
  onApplySpotRate: (rate: number) => void;
  appliedBudget?: string;
}

export const DynamicSpotRateCard: React.FC<DynamicSpotRateCardProps> = ({
  originLocation,
  destinationLocation,
  corridorDistanceKm,
  weightTons,
  cargoCategory,
  specialHandling,
  onApplySpotRate,
  appliedBudget,
}) => {
  const { user } = useAuth();
  const { language: rawLanguage } = useLanguage();
  const isAm = (rawLanguage || '').toUpperCase() === 'AM';
  const isOm = (rawLanguage || '').toUpperCase() === 'OM';
  const language = isAm ? 'am' : isOm ? 'om' : 'en';
  const [pricingResult, setPricingResult] = useState<SpotPricingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showItemizedBreakdown, setShowItemizedBreakdown] = useState<boolean>(true);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [countdownMinutes, setCountdownMinutes] = useState<number>(60);

  const fetchSpotRate = async () => {
    if (!originLocation.address || !destinationLocation.address) return;

    setLoading(true);
    try {
      const res = await fetch('/api/pricing/spot-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: originLocation.lat,
          originLng: originLocation.lng,
          originName: originLocation.address,
          destLat: destinationLocation.lat,
          destLng: destinationLocation.lng,
          destName: destinationLocation.address,
          weightTons: parseFloat(weightTons) || 30.0,
          cargoType: cargoCategory || 'GENERAL_CONTAINER',
          isRefrigerated: specialHandling?.toLowerCase().includes('refrigerated'),
          isHazardous: specialHandling?.toLowerCase().includes('hazardous'),
          requesterId: user?.id,
          requesterEmail: user?.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pricing) {
          setPricingResult(data.pricing);
          setCountdownMinutes(60);
        }
      }
    } catch (err) {
      console.warn('Failed to calculate dynamic spot rate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!originLocation.address || !destinationLocation.address) return;

    const timer = setTimeout(() => {
      fetchSpotRate();
    }, 600);

    return () => clearTimeout(timer);
  }, [
    originLocation.address,
    destinationLocation.address,
    weightTons,
    cargoCategory,
    specialHandling,
  ]);

  // Hourly refresh countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownMinutes((prev) => (prev > 1 ? prev - 1 : 60));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!originLocation.address || !destinationLocation.address) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-1 text-slate-700 font-bold">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <span>{language === 'am' ? 'ተለዋዋጭ የቦታ ዋጋ ስሌት ሞተር' : language === 'om' ? 'Mootora Madaallii Gatii Naannoo' : 'Dynamic Spot Rate Engine'}</span>
        </div>
        {language === 'am'
          ? 'የወቅቱን ትክክለኛ የኮሪደር ስፖት ዋጋ ከዝርዝር ወጪ ክፍፍል ጋር ለማስላት የመነሻ እና መድረሻ አድራሻዎችን ከላይ ይምረጡ።'
          : language === 'om'
          ? 'Gatii ispoottii koriidarii yeroo ammaa ibsa bal’aa waliin shallaguuf bakka ka’umsaa fi ga’umsaa armaan olitti filadhaa.'
          : 'Select origin and destination locations above to compute real-time corridor spot rate with itemized transparency.'}
      </div>
    );
  }

  const isApplied =
    pricingResult && appliedBudget === String(pricingResult.totalSpotRateEtb);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-sky-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-10">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            {language === 'am' ? 'ወቅታዊ የኮሪደር መመዘኛ የታሪፍ ዋጋ' : language === 'om' ? 'Gatii Madaallii Koriidarii Yeroo Ammaa' : 'Prevailing Corridor Benchmark Rate'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {language === 'am'
                ? `በየሰዓቱ የሚታደስ፡ የሚቆየው ለ ${countdownMinutes} ደቂቃ`
                : language === 'om'
                ? `Haareffama Sa’aatii: Yeroo hafe ${countdownMinutes}d`
                : `Hourly Refresh: Valid for ${countdownMinutes}m`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSpotRate}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          <span>
            {loading
              ? (language === 'am' ? 'በማስላት ላይ...' : language === 'om' ? 'Shallagaa jira...' : 'Recalculating...')
              : (language === 'am' ? 'ዋጋ አድስ' : language === 'om' ? 'Gatii Haaressi' : 'Refresh Rate')}
          </span>
        </button>
      </div>

      {pricingResult ? (
        <div className="space-y-4 relative z-10">
          {/* Main Rate & Bounds Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {language === 'am' ? 'የተሰላ ስፖት ዋጋ (ከታክስ በፊት)' : language === 'om' ? 'Gatii Ispoottii Shallagame (Gibira Dura)' : 'Calculated Spot Rate (Pre-Tax)'}
              </span>
              <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ETB {pricingResult.totalSpotRateEtb.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  (ETB {pricingResult.itemizedBreakdown.totalWithVatEtb.toLocaleString()} {language === 'am' ? 'ከ 15% ቫት ጋር' : language === 'om' ? 'VAT 15% dabalatee' : 'incl. 15% VAT'})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-mono">
                <span>{language === 'am' ? 'ዝቅተኛ ወለል:' : language === 'om' ? 'Gadi-aanaa:' : 'Floor:'} ETB {pricingResult.floorBoundEtb.toLocaleString()} (-12%)</span>
                <span>•</span>
                <span>{language === 'am' ? 'ከፍተኛ ጣሪያ:' : language === 'om' ? 'Olaanaa:' : 'Ceiling:'} ETB {pricingResult.ceilingBoundEtb.toLocaleString()} (+18%)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onApplySpotRate(pricingResult.totalSpotRateEtb);
                setAppliedSuccess(true);
                setTimeout(() => setAppliedSuccess(false), 2500);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 ${
                isApplied || appliedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isApplied || appliedSuccess
                  ? (language === 'am' ? 'በዒላማ በጀት ላይ ተተግብሯል ✓' : language === 'om' ? 'Baajata Irratti Dabalameera ✓' : 'Applied to Target Budget ✓')
                  : (language === 'am' ? 'ይህንን ስፖት ዋጋ እንደ በጀት ተጠቀም' : language === 'om' ? 'Gatii Kana Akka Baajataatti Fayyadami' : 'Use Spot Rate as Budget')}
              </span>
            </button>
          </div>

          {/* Itemized Cost Breakdown Toggle (FR 4.4.1 Transparency) */}
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowItemizedBreakdown(!showItemizedBreakdown)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {language === 'am' ? 'ግልጽ የነጠላ ወጪዎች ዝርዝር ክፍፍል' : language === 'om' ? 'Ibsa Baasii Bal’aa Ifa Ta’e' : 'Transparent Itemized Cost Breakdown'}
                </span>
              </span>
              {showItemizedBreakdown ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showItemizedBreakdown && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-xs space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {/* Base corridor rate */}
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-600">
                      {language === 'am'
                        ? `የኮሪደሩ መነሻ ዋጋ (${pricingResult.itemizedBreakdown.baseRatePerKm} ብር/ኪ.ሜ × ${pricingResult.distanceKm} ኪ.ሜ):`
                        : language === 'om'
                        ? `Gatii Ka’umsaa Koriidarii (${pricingResult.itemizedBreakdown.baseRatePerKm} ETB/km × ${pricingResult.distanceKm} km):`
                        : `Base Corridor Rate (${pricingResult.itemizedBreakdown.baseRatePerKm} ETB/km × ${pricingResult.distanceKm} km):`}
                    </span>
                    <span className="font-bold font-mono text-slate-900">
                      ETB {pricingResult.itemizedBreakdown.baseFreightEtb.toLocaleString()}
                    </span>
                  </div>

                  {/* Demand index */}
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-600">
                      {language === 'am'
                        ? `የፍላጎት እና የአቅም ሚዛን (${pricingResult.itemizedBreakdown.demandIndexFactor}× ማባዣ):`
                        : language === 'om'
                        ? `Madaallii Fedhii fi Dandeettii (${pricingResult.itemizedBreakdown.demandIndexFactor}×):`
                        : `Corridor Demand-to-Capacity (${pricingResult.itemizedBreakdown.demandIndexFactor}× index):`}
                    </span>
                    <span className="font-bold font-mono text-amber-700">
                      +ETB {pricingResult.itemizedBreakdown.demandAdjustmentEtb.toLocaleString()}
                    </span>
                  </div>

                  {/* Fuel index */}
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-sky-600" />
                      {language === 'am'
                        ? `የናፍጣ ጭማሪ (${pricingResult.itemizedBreakdown.dieselPricePerLiter} ብር/ሊ vs ${pricingResult.itemizedBreakdown.baselineDieselPrice}):`
                        : language === 'om'
                        ? `Dabalata Dhiyeessii Boba’aa (${pricingResult.itemizedBreakdown.dieselPricePerLiter} ETB/L vs ${pricingResult.itemizedBreakdown.baselineDieselPrice}):`
                        : `Diesel Multiplier (${pricingResult.itemizedBreakdown.dieselPricePerLiter} ETB/L vs ${pricingResult.itemizedBreakdown.baselineDieselPrice}):`}
                    </span>
                    <span className="font-bold font-mono text-sky-700">
                      +ETB {pricingResult.itemizedBreakdown.fuelSurchargeEtb.toLocaleString()}
                    </span>
                  </div>

                  {/* Congestion surcharge */}
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-600">
                      {language === 'am'
                        ? 'የፍተሻ ኬላዎች መዘግየት (ገላፊ እና ሞጆ):'
                        : language === 'om'
                        ? 'Turtii Qorannoo Buufata (Galaafii fi Moojoo):'
                        : 'Checkpoint Delays (Galafi & Modjo):'}
                    </span>
                    <span className="font-bold font-mono text-purple-700">
                      +ETB {pricingResult.itemizedBreakdown.congestionSurchargeEtb.toLocaleString()}
                    </span>
                  </div>

                  {/* Special handling */}
                  {pricingResult.itemizedBreakdown.specialHandlingEtb > 0 && (
                    <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-200 sm:col-span-2">
                      <span className="text-slate-600">
                        {language === 'am'
                          ? 'ልዩ የአያያዝ ተጨማሪ ክፍያ (ማቀዝቀዣ / አደገኛ ዕቃዎች ፕሮቶኮል):'
                          : language === 'om'
                          ? 'Kaffaltii Dabalataa Qabiinsa Addaa (Reefer / Meeshaalee Balaa Qaban):'
                          : 'Special Handling Surcharge (Reefer / Dangerous Goods Protocol):'}
                      </span>
                      <span className="font-bold font-mono text-rose-700">
                        +ETB {pricingResult.itemizedBreakdown.specialHandlingEtb.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold">
                  <span className="text-slate-600">
                    {language === 'am' ? '15% የተጨማሪ እሴት ታክስ (ቫት):' : language === 'om' ? 'Gibira Dabalata Qabeenyaa 15% (VAT):' : '15% Value Added Tax (VAT):'}
                  </span>
                  <span className="font-mono text-slate-900">
                    ETB {pricingResult.itemizedBreakdown.vat15PctEtb.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-slate-500">
          {language === 'am' ? 'ተለዋዋጭ የኮሪደር ዋጋ በመሰላት ላይ ነው...' : language === 'om' ? 'Gatiin koriidarii shallagamaa jira...' : 'Computing dynamic corridor rates...'}
        </div>
      )}
    </div>
  );
};
