import React, { useState } from 'react';
import {
  Users,
  Layers,
  Package,
  ArrowUpRight,
  Search,
  RefreshCw,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { ForwarderStats, ForwarderClientItem } from '../types';

interface MultiShipperTabProps {
  stats: ForwarderStats;
  clients: ForwarderClientItem[];
  loading: boolean;
  onRefresh: () => void;
  onNavigateConsolidation: () => void;
}

export const MultiShipperTab: React.FC<MultiShipperTabProps> = ({
  stats,
  clients = [],
  loading,
  onRefresh,
  onNavigateConsolidation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter((c) => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = c.fullName.toLowerCase().includes(q);
      const matchCompany = c.companyName.toLowerCase().includes(q);
      const matchTin = c.tin.toLowerCase().includes(q);
      return matchName || matchCompany || matchTin;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-indigo-800/60 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10.5px] font-extrabold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>Freight Forwarder Operations • Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Multi-Shipper Cargo Portfolio
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Consolidated overview across multiple cargo clients along the Djibouti–Modjo–Addis corridor. Coordinate LTL cargo bundling, batch customs filings, and end-to-end multimodal transport.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={onNavigateConsolidation}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Launch LTL Consolidation ➔</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Client Accounts</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.activeClients}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">
            Consignors Managed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            <span>Total Loads Tracked</span>
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {stats.totalLoadsManaged}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Active: {stats.activeLoadsManaged} In-Flight
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>Average Haulage Savings</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.averageSavingsPct}%
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            Via LTL ➔ FTL Bundling
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Corridor Compliance</span>
          </div>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-[10px] text-slate-400 font-medium">
            Single Window Cleared
          </div>
        </div>
      </div>

      {/* 3. Search & Clients List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Managed Shipper Clients ({filteredClients.length})
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by company, TIN, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    TIN: {client.tin}
                  </span>
                  <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {client.verificationStatus}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">{client.companyName}</h3>
                <p className="text-xs text-slate-500">Contact: {client.fullName}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-black text-indigo-700 font-mono">
                  {client.totalTonnageManaged} Tons
                </div>
                <div className="text-[10px] text-slate-400">Total Volume</div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
            </div>

            {/* Recent Consignments */}
            {client.recentLoads.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[10.5px] font-bold text-slate-400 uppercase">Recent Consignments:</div>
                <div className="space-y-1">
                  {client.recentLoads.map((l) => (
                    <div
                      key={l.id}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {l.loadCode}
                        </span>
                        <span className="font-medium text-slate-900 truncate max-w-[160px]">{l.title}</span>
                      </div>
                      <span className="text-[10.5px] font-mono font-bold text-indigo-600">{l.weightTons}T</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
