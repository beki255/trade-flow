import React from 'react';
import { Inbox } from 'lucide-react';
import { CustomsStats } from '../types';

interface ReviewQueueTabProps {
  stats: CustomsStats;
}

export const ReviewQueueTab: React.FC<ReviewQueueTabProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#064E3B] to-[#047857] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-emerald-800">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
            Customs Authority Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Customs Document Verification Queue
          </h1>
          <p className="text-xs text-emerald-100">
            Inspect and validate Bill of Lading, Commercial Invoices, and Automated Green/Red Line Clearance.
          </p>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Pending Document Reviews
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.pendingReviews}
          </div>
          <div className="text-[10px] text-slate-400">
            Galafi & Mojo Terminals
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Green Line Cleared
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.greenLineCleared}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            Zero Delay Fast Track
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Audit Inspection Rate
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.inspectionRate}
          </div>
          <div className="text-[10px] text-slate-400">
            Compliance Score
          </div>
        </div>
      </div>

      {/* Review Queue Feed */}
      <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
        <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          {stats.pendingReviews === 0 ? 'All checkpoint queues clear' : `${stats.pendingReviews} shipments in queue`}
        </div>
        <p className="text-[11px] text-slate-500">
          New customs documents submitted by shippers and forwarders will appear here for inspector verification.
        </p>
      </div>
    </div>
  );
};
