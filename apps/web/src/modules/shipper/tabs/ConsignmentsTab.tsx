import React, { useState, useMemo } from 'react';
import {
  Package,
  PlusCircle,
  Trash2,
  ExternalLink,
  Inbox,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  MapPin,
  Route,
  Gavel,
  Navigation,
} from 'lucide-react';
import { ShipmentItem } from '../types';

interface ConsignmentsTabProps {
  shipments: ShipmentItem[];
  onDeleteLoad?: (rawLoadId: string) => void;
  deleteLoadingId?: string | null;
  onNavigatePostLoad?: () => void;
  onNavigateBids?: () => void;
  onNavigateTracking?: () => void;
}

export const ConsignmentsTab: React.FC<ConsignmentsTabProps> = ({
  shipments = [],
  onDeleteLoad,
  deleteLoadingId,
  onNavigatePostLoad,
  onNavigateBids,
  onNavigateTracking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: shipments.length,
      open: shipments.filter((s) => s.status === 'OPEN' || s.status === 'POSTED' || s.status === 'MATCHED').length,
      inTransit: shipments.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'ASSIGNED' || s.status === 'DISPATCHED').length,
      delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
    };
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      // Status Filter
      if (statusFilter === 'OPEN' && !(item.status === 'OPEN' || item.status === 'POSTED' || item.status === 'MATCHED')) {
        return false;
      }
      if (statusFilter === 'IN_TRANSIT' && !(item.status === 'IN_TRANSIT' || item.status === 'ASSIGNED' || item.status === 'DISPATCHED')) {
        return false;
      }
      if (statusFilter === 'DELIVERED' && item.status !== 'DELIVERED') {
        return false;
      }

      // Search Filter
      if (searchTerm.trim().length > 0) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesId = item.id?.toLowerCase().includes(q);
        const matchesOrigin = item.originName?.toLowerCase().includes(q);
        const matchesDest = item.destName?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        return matchesTitle || matchesId || matchesOrigin || matchesDest || matchesType;
      }

      return true;
    });
  }, [shipments, statusFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. HERO / HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wider uppercase">
              <Package className="w-3.5 h-3.5" />
              <span>Shipper Freight Portfolio (SRS 4.2)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Consignments
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed font-medium">
              Monitor your corridor freight postings, inspect incoming carrier bidding proposals, and track dispatched shipments from Djibouti to inland hubs.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {onNavigatePostLoad && (
              <button
                type="button"
                onClick={onNavigatePostLoad}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Load</span>
              </button>
            )}
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Total Posted</div>
            <div className="text-xl font-black text-white mt-1">{counts.all}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-300">Open / Bidding</div>
            <div className="text-xl font-black text-amber-400 mt-1">{counts.open}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-sky-300">In-Transit (Live)</div>
            <div className="text-xl font-black text-sky-400 mt-1">{counts.inTransit}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-300">Delivered (e-POD)</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{counts.delivered}</div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Open RFQ ({counts.open})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('IN_TRANSIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'IN_TRANSIT'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In-Transit ({counts.inTransit})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DELIVERED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'DELIVERED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivered ({counts.delivered})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search consignments, route, or cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
          />
        </div>
      </div>

      {/* 3. CONSIGNMENTS LIST */}
      {filteredShipments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-slate-900">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No matching freight consignments found'
                : 'No Posted Freight Consignments'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or switching the status filter tab.'
                : 'You have not registered any cargo postings on TradeFlow yet. Click below to broadcast your first load to verified corridor carriers.'}
            </p>
          </div>

          {onNavigatePostLoad && (
            <button
              type="button"
              onClick={onNavigatePostLoad}
              className="mt-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post First Consignment</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((item) => {
            const isDelivered = item.status === 'DELIVERED';
            const isInTransit = item.status === 'IN_TRANSIT' || item.status === 'ASSIGNED' || item.status === 'DISPATCHED';

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all shadow-xs space-y-4"
              >
                {/* Header: Ref ID, Cargo Title, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[10.5px] font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {item.id}
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      {item.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      {item.type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black border flex items-center gap-1.5 ${
                        isDelivered
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : isInTransit
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'MATCHED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          <span>DELIVERED (e-POD)</span>
                        </>
                      ) : isInTransit ? (
                        <>
                          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                          <span>IN-TRANSIT (LIVE)</span>
                        </>
                      ) : (
                        <span>{item.status}</span>
                      )}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Posted on {item.createdAt}</span>
                  </span>
                </div>

                {/* Corridor Route & Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Route */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Route className="w-3 h-3 text-sky-600" />
                      <span>Corridor Route</span>
                    </div>
                    <div className="font-bold text-slate-800 flex flex-wrap items-center gap-1.5 text-xs mt-1">
                      <span>{item.originName || 'Addis Ababa'}</span>
                      <span className="text-sky-600 font-black">➔</span>
                      <span>{item.destName || 'Djibouti Port'}</span>
                    </div>
                    {item.distanceKm && (
                      <div className="mt-1 font-mono text-[10.5px] text-sky-700 font-bold">
                        🛣️ {item.distanceKm} km Road Distance
                      </div>
                    )}
                  </div>

                  {/* Weight / Cargo */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Payload & Weight
                    </div>
                    <div className="font-black text-slate-900 text-sm mt-1">
                      {item.weight}
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      Standard Commercial Freight
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Target Budget / Pricing
                    </div>
                    <div className="font-black text-slate-900 text-sm mt-1">
                      {item.budget}
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      {item.targetBudgetEtb ? 'Spot Rate Cap' : 'Competitive RFQ'}
                    </div>
                  </div>
                </div>

                {/* Specifications note */}
                {item.cargoDescription && (
                  <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-800">Cargo Details: </span>
                    <span>{item.cargoDescription}</span>
                  </div>
                )}

                {/* Bottom Action Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Quotes Received */}
                    {item.bidsCount && item.bidsCount > 0 ? (
                      <button
                        type="button"
                        onClick={onNavigateBids}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Gavel className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.bidsCount} Carrier Quotes Received</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        ⏳ Awaiting carrier quotes in marketplace
                      </span>
                    )}

                    {/* Live Tracking Link if in transit or delivered */}
                    {(isInTransit || isDelivered) && onNavigateTracking && (
                      <button
                        type="button"
                        onClick={onNavigateTracking}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isDelivered ? 'View Delivery e-POD' : 'Live Tracking'}</span>
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div className="flex items-center gap-2">
                    {onDeleteLoad && (
                      <button
                        type="button"
                        onClick={() => onDeleteLoad(item.rawId)}
                        disabled={deleteLoadingId === item.rawId}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Cancel and delete load posting"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>
                          {deleteLoadingId === item.rawId ? 'Deleting...' : 'Delete Consignment'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
