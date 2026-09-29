import React from 'react';
import {
  GitMerge,
  Ship,
  Train,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { MultimodalContainerItem } from '../types';

interface MultimodalTabProps {
  containers: MultimodalContainerItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const MultimodalTab: React.FC<MultimodalTabProps> = ({
  containers = [],
  loading,
  onRefresh,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-900 text-[11px] font-bold tracking-wide">
            <GitMerge className="w-3.5 h-3.5 text-sky-600" />
            <span>Multi-Modal Corridor Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Port to Dry Port to Regional Warehouse Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Monitor container freight progression across the 4 key intermodal transport legs: Red Sea Ocean Discharge ➔ Ethio-Djibouti Rail/Corridor Haulage ➔ Modjo Dry Port Customs Terminal ➔ Final Regional Delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="relative z-10 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Fleet</span>
        </button>
      </div>

      {/* 2. Corridor Multimodal 4-Leg Reference Guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-[10.5px] font-bold text-sky-700 uppercase flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-sky-600" />
            <span>Leg 1: Ocean Discharge</span>
          </div>
          <div className="text-xs font-black text-slate-900">Djibouti Port Terminal</div>
          <div className="text-[10px] text-slate-400">Vessel unberthing & handling</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-[10.5px] font-bold text-indigo-700 uppercase flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5 text-indigo-600" />
            <span>Leg 2: Corridor Transit</span>
          </div>
          <div className="text-xs font-black text-slate-900">Heavy Freight Rail / Highway</div>
          <div className="text-[10px] text-slate-400">Galafi Border ➔ Dire Dawa</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-[10.5px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span>Leg 3: Dry Port In-Bond</span>
          </div>
          <div className="text-xs font-black text-slate-900">Modjo Multimodal Terminal</div>
          <div className="text-[10px] text-slate-400">Customs clearance & green line</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="text-[10.5px] font-bold text-purple-700 uppercase flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>Leg 4: Final Regional Delivery</span>
          </div>
          <div className="text-xs font-black text-slate-900">Addis Ababa / Regional Hubs</div>
          <div className="text-[10px] text-slate-400">Direct warehouse delivery</div>
        </div>
      </div>

      {/* 3. Active Multimodal Container Trackers */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-sky-600" />
          <span>Active Intermodal Container Consignments ({containers.length}):</span>
        </h3>

        {containers.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
            <GitMerge className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">No Active Intermodal Shipments</div>
            <p className="text-[11px] text-slate-500">
              When corridor shipments depart from origin or transit through Modjo Dry Port, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {containers.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded">
                        {c.containerNo}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {c.consignmentCode}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900">{c.title} ({c.weightTons} Tons)</h4>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 font-mono">{c.estimatedArrival}</div>
                    <div className="text-[10px] text-slate-400">Dynamic ETA Margin</div>
                  </div>
                </div>

                {/* 4-Step Progress Bar */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((leg) => {
                      const isPastOrCurrent = leg <= c.currentLeg;
                      const isCurrent = leg === c.currentLeg;
                      return (
                        <div key={leg} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isPastOrCurrent
                                ? isCurrent
                                  ? 'bg-sky-500 animate-pulse'
                                  : 'bg-emerald-500'
                                : 'bg-slate-200'
                            }`}
                          />
                          <div className={`text-[10px] font-bold ${
                            isCurrent ? 'text-sky-700' : isPastOrCurrent ? 'text-emerald-700' : 'text-slate-400'
                          }`}>
                            Leg {leg}: {leg === 1 ? 'Ocean' : leg === 2 ? 'Corridor' : leg === 3 ? 'Dry Port' : 'Last Mile'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-between">
                    <span>Active Stage: <strong className="text-slate-900">{c.legLabel}</strong></span>
                    <span className="text-slate-500 font-mono text-[11px]">Carrier: {c.carrier}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
