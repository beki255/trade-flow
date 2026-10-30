import React from 'react';
import { Cpu, CreditCard, ShieldCheck, Check, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { AIMatchCarrier, MatchingSLA } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AIMatchingResultsCardProps {
  matchedTransporters: AIMatchCarrier[];
  matchingSla: MatchingSLA | null;
  matchingPreference?: 'BALANCED' | 'COST_PRIORITY' | 'SPEED_PRIORITY' | 'RELIABILITY_PRIORITY';
  onSelectCarrier: (carrier: AIMatchCarrier) => void;
}

export const AIMatchingResultsCard: React.FC<AIMatchingResultsCardProps> = ({
  matchedTransporters,
  matchingSla,
  matchingPreference = 'BALANCED',
  onSelectCarrier,
}) => {
  const { language: rawLanguage } = useLanguage();
  const isAm = (rawLanguage || '').toUpperCase() === 'AM';
  const isOm = (rawLanguage || '').toUpperCase() === 'OM';
  const language = isAm ? 'am' : isOm ? 'om' : 'en';

  if (matchedTransporters.length === 0) return null;

  const preferenceTitles: Record<string, { en: string; am: string; om: string }> = {
    BALANCED: {
      en: 'Balanced Utility (Cost 35% • Reliability 30% • Proximity 20% • Fuel 15%)',
      am: 'ሚዛናዊ ጥቅም (ዋጋ 35% • አስተማማኝነት 30% • ቅርበት 20% • ነዳጅ 15%)',
      om: 'Faayidaa Madaalawaa (Gatii 35% • Amanamummaa 30% • Dhiyoo 20% • Boba\'aa 15%)',
    },
    COST_PRIORITY: {
      en: 'Cost Priority Optimization (Cost 55% • Reliability 20% • Proximity 15% • Fuel 10%)',
      am: 'የዋጋ ቅድሚያ ማመቻቸት (ዋጋ 55% • አስተማማኝነት 20% • ቅርበት 15% • ነዳጅ 10%)',
      om: 'Dursa Gatii Mijeessuu (Gatii 55% • Amanamummaa 20% • Dhiyoo 15% • Boba\'aa 10%)',
    },
    SPEED_PRIORITY: {
      en: 'Transit Speed & Proximity Optimization (Speed 45% • Reliability 30% • Cost 15% • Fuel 10%)',
      am: 'የጉዞ ፍጥነት እና ቅርበት ማመቻቸት (ፍጥነት 45% • አስተማማኝነት 30% • ዋጋ 15% • ነዳጅ 10%)',
      om: 'Saffisa Imalaafi Dhiyoo Mijeessuu (Saffisa 45% • Amanamummaa 30% • Gatii 15% • Boba\'aa 10%)',
    },
    RELIABILITY_PRIORITY: {
      en: 'Historical Reliability & Safety (Reliability 50% • Cost 20% • Proximity 15% • Fuel 15%)',
      am: 'ታሪካዊ አስተማማኝነት እና ደህንነት (አስተማማኝነት 50% • ዋጋ 20% • ቅርበት 15% • ነዳጅ 15%)',
      om: 'Amanamummaa Seenaa fi Nageenya (Amanamummaa 50% • Gatii 20% • Dhiyoo 15% • Boba\'aa 15%)',
    },
  };

  const getPrefTitle = (pref: string) => {
    const item = preferenceTitles[pref] || preferenceTitles.BALANCED;
    if (language === 'am') return item.am;
    if (language === 'om') return item.om;
    return item.en;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
      {/* Header & SLA Benchmarking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span>
              {language === 'am'
                ? 'በ AI የተመደቡ የተረጋገጡ የመተላለፊያ አጓጓዦች'
                : language === 'om'
                ? "Fe'attoota Daandii AI'n Sadarkeessite fi Mirkanaa'an"
                : 'AI-Ranked Verified Corridor Transporters'}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>
                {language === 'am'
                  ? `${matchedTransporters.length} የተረጋገጡ እጩዎች`
                  : language === 'om'
                  ? `Kaadhimamtoota Mirkanaa'an ${matchedTransporters.length}`
                  : `${matchedTransporters.length} Verified Candidates`}
              </span>
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">
              {language === 'am'
                ? 'ተግባራዊ የተደረጉ ሚዛኖች:'
                : language === 'om'
                ? 'Madaalliiwwan Hojiirra Oolan:'
                : 'Applied Weights:'}
            </span>{' '}
            {getPrefTitle(matchingPreference)}
          </p>
        </div>

        {matchingSla && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs">
            <span className="text-emerald-400">
              {language === 'am'
                ? 'የማዛመጃ ፍጥነት:'
                : language === 'om'
                ? 'Saffisa Wal-simsiisaa:'
                : 'Match Speed:'}
            </span>
            <span>{matchingSla.actualExecutionTimeMs}</span>
            <span className="text-slate-400">({matchingSla.target})</span>
          </div>
        )}
      </div>

      {/* Ranked Transporters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matchedTransporters.map((carrier, idx) => (
          <div
            key={carrier.carrierId || idx}
            className={`p-5 rounded-2xl border transition-all space-y-3 relative flex flex-col justify-between ${
              idx === 0
                ? 'border-sky-500 bg-sky-50/20 shadow-sm ring-1 ring-sky-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {idx === 0 && (
              <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>
                  {language === 'am'
                    ? 'ከፍተኛ አዛማጅ'
                    : language === 'om'
                    ? 'Wal-gitiinsa Olaanaa'
                    : 'Top Match'}
                </span>
              </span>
            )}

            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>#{idx + 1} {carrier.companyName}</span>
                    <span
                      title={
                        language === 'am'
                          ? 'የተረጋገጠ አጓጓዥ'
                          : language === 'om'
                          ? "Fe'aa Mirkanaa'e"
                          : 'Verified Carrier'
                      }
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <span>
                      {language === 'am'
                        ? `ደረጃ: ${carrier.ratingStars}/5.0 (${carrier.totalCompletedTrips} ጉዞዎች)`
                        : language === 'om'
                        ? `Sadarkaa: ${carrier.ratingStars}/5.0 (imala ${carrier.totalCompletedTrips})`
                        : `Rating: ${carrier.ratingStars}/5.0 (${carrier.totalCompletedTrips} trips)`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">
                    {carrier.totalMatchScorePct}%
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase font-black">
                    {language === 'am'
                      ? 'የጥቅም ውጤት'
                      : language === 'om'
                      ? 'Qabxii Faayidaa'
                      : 'Utility Score'}
                  </div>
                </div>
              </div>

              {/* Spot Rate & Truck */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    {language === 'am'
                      ? 'የወቅቱ ዋጋ:'
                      : language === 'om'
                      ? 'Gatii Yeroo:'
                      : 'Spot Rate:'}
                  </span>
                  <span className="font-black text-sky-700">
                    {carrier.calculatedSpotRateEtb.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>
                    {language === 'am' ? 'ጭነት መኪና:' : language === 'om' ? 'Makiinaa:' : 'Truck:'}{' '}
                    <strong className="text-slate-800">{carrier.assignedTruckPlate}</strong>
                  </span>
                  <span>
                    {language === 'am' ? 'መጠን:' : language === 'om' ? 'Dandeettii:' : 'Capacity:'}{' '}
                    <strong className="text-slate-800">
                      {carrier.payloadCapacityTons ? `${carrier.payloadCapacityTons} ` : '— '}
                      {carrier.payloadCapacityTons ? (language === 'am' ? 'ቶን' : language === 'om' ? 'Toonii' : 'Tons') : ''}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5 border-t border-slate-200/50">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    {language === 'am'
                      ? 'ክብደት ተዛምዷል'
                      : language === 'om'
                      ? 'Ulfaatinni Wal-giteera'
                      : 'Weight Matched'}
                  </span>
                  <span>
                    {language === 'am' ? 'የሚደርስበት:' : language === 'om' ? 'Yeroo Dhaqqabii:' : 'ETA:'}{' '}
                    {carrier.estimatedTransitHours}
                  </span>
                </div>
              </div>

              {/* Weighted Utility Breakdown */}
              <div className="space-y-1.5 text-[10px] border-t border-slate-100 pt-2">
                <div className="font-bold text-slate-700">
                  {language === 'am'
                    ? 'የጥቅም ውጤት ዝርዝር:'
                    : language === 'om'
                    ? 'Caccabsa Qabxii Faayidaa:'
                    : 'Utility Score Breakdown:'}
                </div>
                <div className="grid grid-cols-2 gap-1 text-slate-500">
                  <div>
                    {language === 'am' ? 'ዋጋ:' : language === 'om' ? 'Gatii:' : 'Cost:'}{' '}
                    <span className="font-bold text-slate-800">{carrier.breakdownScores.costOptimization}</span>
                  </div>
                  <div>
                    {language === 'am' ? 'አስተማማኝነት:' : language === 'om' ? 'Amanamummaa:' : 'Reliability:'}{' '}
                    <span className="font-bold text-slate-800">{carrier.breakdownScores.historicalReliability}</span>
                  </div>
                  <div>
                    {language === 'am' ? 'የነዳጅ ቁጠባ:' : language === 'om' ? "Qusannaa Boba'aa:" : 'Fuel Eco:'}{' '}
                    <span className="font-bold text-slate-800">{carrier.breakdownScores.fuelEfficiency}</span>
                  </div>
                  <div>
                    {language === 'am' ? 'ቅርበት:' : language === 'om' ? 'Dhiyoo:' : 'Proximity:'}{' '}
                    <span className="font-bold text-slate-800">{carrier.breakdownScores.proximityAndAvailability}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Action */}
            <button
              onClick={() => onSelectCarrier(carrier)}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                idx === 0
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {language === 'am'
                  ? 'የ AI ማዛመጃ ጥያቄ ላክ ➔'
                  : language === 'om'
                  ? 'Dhiheessa AI Ergi ➔'
                  : 'Send AI Match Offer ➔'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
