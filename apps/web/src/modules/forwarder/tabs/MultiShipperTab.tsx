import React from 'react';
import { Layers, Inbox } from 'lucide-react';
import { ForwarderStats } from '../types';

interface MultiShipperTabProps {
  stats: ForwarderStats;
  onNavigateConsolidation: () => void;
}

export const MultiShipperTab: React.FC<MultiShipperTabProps> = ({
  stats,
  onNavigateConsolidation,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-indigo-900/50">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A5B4FC]">
            Freight Forwarder Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Freight Forwarder Portal
          </h1>
          <p className="text-xs text-indigo-200">
            Multi-Client Freight & LTL Consolidation Management along Djibouti–Addis Corridor.
          </p>
        </div>

        <button
          onClick={onNavigateConsolidation}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>LTL Consolidation</span>
        </button>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Active Clients
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.activeClients}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">
            Multi-Shipper Portfolio
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Consolidated FTLs
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.consolidatedLoads}</div>
          <div className="text-[10px] text-purple-600 font-semibold">
            High-Cube Container Shipments
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Average Savings
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.savingsPercentage > 0 ? `${stats.savingsPercentage}%` : '0%'}
          </div>
          <div className="text-[10px] text-slate-400">
            LTL Route Optimization
          </div>
        </div>
      </div>

      {/* Clients Load Queue */}
      <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
        <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          Awaiting client load submissions
        </div>
        <p className="text-[11px] text-slate-500">
          Shipper client assignments will populate in this dashboard for consignment tracking and batch customs dispatch.
        </p>
      </div>
    </div>
  );
};
