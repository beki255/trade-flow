import React from 'react';
import { Cpu, CreditCard, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { AIMatchCarrier, MatchingSLA } from '../types';

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
  if (matchedTransporters.length === 0) return null;

  const preferenceTitles: Record<string, string> = {
    BALANCED: 'Balanced Utility (Cost 35% • Reliability 30% • Proximity 20% • Fuel 15%)',
    COST_PRIORITY: 'Cost Priority Optimization (Cost 55% • Reliability 20% • Proximity 15% • Fuel 10%)',
    SPEED_PRIORITY: 'Transit Speed & Proximity Optimization (Speed 45% • Reliability 30% • Cost 15% • Fuel 10%)',
    RELIABILITY_PRIORITY: 'Historical Reliability & Safety (Reliability 50% • Cost 20% • Proximity 15% • Fuel 15%)',
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
      {/* Header & SLA Benchmarking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span>AI-Ranked Verified Corridor Transporters</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{matchedTransporters.length} Verified Candidates</span>
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">Applied Weights:</span> {preferenceTitles[matchingPreference] || preferenceTitles.BALANCED}
          </p>
        </div>

        {matchingSla && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs">
            <span className="text-emerald-400">Match Speed:</span>
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
                <span>Top Match</span>
              </span>
            )}

            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>#{idx + 1} {carrier.companyName}</span>
                    <span title="Verified Carrier">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <span>Rating: {carrier.ratingStars}/5.0 ({carrier.totalCompletedTrips} trips)</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">
                    {carrier.totalMatchScorePct}%
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase font-black">Utility Score</div>
                </div>
              </div>

              {/* Spot Rate & Truck */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Spot Rate:</span>
                  <span className="font-black text-sky-700">
                    {carrier.calculatedSpotRateEtb.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Truck: {carrier.assignedTruckPlate}</span>
                  <span>ETA: {carrier.estimatedTransitHours}</span>
                </div>
              </div>

              {/* Weighted Utility Breakdown */}
              <div className="space-y-1.5 text-[10px] border-t border-slate-100 pt-2">
                <div className="font-bold text-slate-700">Utility Score Breakdown:</div>
                <div className="grid grid-cols-2 gap-1 text-slate-500">
                  <div>Cost: <span className="font-bold text-slate-800">{carrier.breakdownScores.costOptimization}</span></div>
                  <div>Reliability: <span className="font-bold text-slate-800">{carrier.breakdownScores.historicalReliability}</span></div>
                  <div>Fuel Eco: <span className="font-bold text-slate-800">{carrier.breakdownScores.fuelEfficiency}</span></div>
                  <div>Proximity: <span className="font-bold text-slate-800">{carrier.breakdownScores.proximityAndAvailability}</span></div>
                </div>
              </div>
            </div>

            {/* Instant Action */}
            <button
              onClick={() => onSelectCarrier(carrier)}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                idx === 0
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Instant Book & Escrow</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
